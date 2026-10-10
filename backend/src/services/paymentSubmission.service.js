import { PaymentSubmission } from '../models/PaymentSubmission.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { emitToHostel, emitToResident } from '../events/socketEvents.js';
import { recordAuditLog } from './audit.service.js';
import { recordPayment } from './payment.service.js';
import { sendEmail } from './email.service.js';
import { sendWhatsApp } from './whatsapp.service.js';
import { uploadBufferToCloudinary, cloudinary } from '../config/cloudinary.js';
import { Hostel } from '../models/Hostel.model.js';
import { formatMoney } from '../utils/money.js';

// ---- Resident-side: submit a claim ----

export async function createSubmission(residentAuth, body, file) {
  if (!file) throw ApiError.badRequest('A payment screenshot is required');

  const invoice = await Invoice.findOne({
    _id: body.invoiceId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!invoice) throw ApiError.notFound('Invoice not found');
  if (invoice.status === 'void') throw ApiError.badRequest('This invoice has been voided');
  if (invoice.status === 'paid') throw ApiError.badRequest('This invoice is already fully paid');

  const balance = invoice.totalMinorUnits - invoice.paidMinorUnits;
  if (body.amountMinorUnits > balance) {
    throw ApiError.badRequest(
      'The amount you entered exceeds the outstanding balance on this invoice'
    );
  }

  const existingPending = await PaymentSubmission.findOne({
    invoiceId: invoice._id,
    status: 'pending',
  });
  if (existingPending) {
    throw ApiError.conflict(
      'You already have a pending payment submission for this invoice — wait for it to be reviewed before submitting another.'
    );
  }

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: `hostel-management/${residentAuth.hostelId}/payment-proofs`,
    resource_type: 'image',
  });

  let submission;
  try {
    submission = await PaymentSubmission.create({
      hostelId: residentAuth.hostelId,
      invoiceId: invoice._id,
      residentId: residentAuth.id,
      amountMinorUnits: body.amountMinorUnits,
      method: body.method,
      paidToLabel: body.paidToLabel,
      transactionReference: body.transactionReference,
      screenshotUrl: result.secure_url,
      screenshotPublicId: result.public_id,
    });
  } catch (err) {
    await cloudinary.uploader.destroy(result.public_id).catch(() => {});
    throw err;
  }

  const resident = await Resident.findById(residentAuth.id);

  emitToHostel(residentAuth.hostelId, 'payment_submission:created', {
    submissionId: submission._id,
    invoiceId: invoice._id,
    residentName: resident?.name ?? 'Unknown',
    amountMinorUnits: submission.amountMinorUnits,
  });

  recordAuditLog({
    hostelId: residentAuth.hostelId,
    actorId: null,
    actorName: resident?.name,
    action: 'payment_submission.created',
    entityType: 'PaymentSubmission',
    entityId: submission._id,
    metadata: {
      invoiceId: invoice._id,
      amountMinorUnits: submission.amountMinorUnits,
      method: submission.method,
    },
  });

  return submission;
}

export async function listMySubmissions(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId: residentAuth.hostelId, residentId: residentAuth.id };
  if (query.invoiceId) filter.invoiceId = query.invoiceId;

  const [items, total] = await Promise.all([
    PaymentSubmission.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PaymentSubmission.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

// ---- Staff-side: review queue ----

export async function listSubmissions(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  filter.status = query.status ?? 'pending'; // default view is the review queue itself

  const [items, total] = await Promise.all([
    PaymentSubmission.find(filter)
      .populate('residentId', 'name registrationNumber')
      .populate('invoiceId', 'invoiceNumber totalMinorUnits paidMinorUnits status')
      .sort({ createdAt: 1 }) // oldest first — a queue to work through, not a feed
      .skip(skip)
      .limit(limit),
    PaymentSubmission.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getSubmissionById(user, id) {
  const submission = await PaymentSubmission.findById(id)
    .populate('residentId', 'name registrationNumber phone email')
    .populate('invoiceId', 'invoiceNumber totalMinorUnits paidMinorUnits status');
  if (!submission) throw ApiError.notFound('Payment submission not found');
  resolveHostelScope(user, submission.hostelId.toString());
  return submission;
}

async function notifyResidentOfReview(resident, { approved, submission, rejectionReason }) {
  if (!resident) return;
  // .catch so a failed lookup can't become an unhandled rejection — callers
  // fire this without awaiting it.
  const hostel = await Hostel.findById(submission.hostelId)
    .select('currency')
    .catch(() => null);
  const amount = formatMoney(submission.amountMinorUnits, hostel?.currency);
  const text = approved
    ? `Hi ${resident.name}, your payment submission of ${amount} has been approved and applied to your invoice.`
    : `Hi ${resident.name}, your payment submission of ${amount} could not be approved. Reason: ${rejectionReason}. Please resubmit with the correct details.`;

  // Best-effort — a notification failure must never undo or block an
  // approval/rejection decision that's already been recorded.
  await Promise.all([
    resident.email
      ? sendEmail({
          to: resident.email,
          subject: approved ? 'Payment approved' : 'Payment submission rejected',
          text,
        })
      : Promise.resolve(),
    sendWhatsApp({ to: resident.phone, body: text }),
  ]).catch(() => {});
}

export async function approveSubmission(user, id) {
  const submission = await PaymentSubmission.findById(id);
  if (!submission) throw ApiError.notFound('Payment submission not found');
  const hostelId = resolveHostelScope(user, submission.hostelId.toString());

  if (submission.status !== 'pending') {
    throw ApiError.conflict(
      `Only a pending submission can be approved (current status: ${submission.status})`
    );
  }

  // Reuses recordPayment() exactly as staff-recorded payments do — receipt
  // numbering, invoice balance/status update, its own socket event and
  // audit log entry. If the invoice's balance no longer covers this amount
  // (e.g. paid some other way since submission), THIS throws and the
  // submission stays 'pending' — nothing here is marked approved on a
  // failed payment record.
  const payment = await recordPayment(
    user,
    {
      invoiceId: submission.invoiceId,
      amountMinorUnits: submission.amountMinorUnits,
      method: submission.method,
      notes: `Approved from resident payment submission (ref: ${submission.transactionReference || 'none given'})`,
    },
    { notifyResident: false }
  );

  submission.status = 'approved';
  submission.reviewedBy = user.id;
  submission.reviewedAt = new Date();
  submission.resultingPaymentId = payment._id;
  await submission.save();

  const resident = await Resident.findById(submission.residentId);
  notifyResidentOfReview(resident, { approved: true, submission });

  recordAuditLog({
    hostelId,
    actorId: user.id,
    action: 'payment_submission.approved',
    entityType: 'PaymentSubmission',
    entityId: submission._id,
    metadata: { paymentId: payment._id, receiptNumber: payment.receiptNumber },
  });

  emitToHostel(hostelId, 'payment_submission:reviewed', {
    submissionId: submission._id,
    residentId: submission.residentId,
    status: 'approved',
  });

  emitToResident(submission.residentId, 'payment_submission:reviewed', {
    submissionId: submission._id,
    invoiceId: submission.invoiceId,
    status: 'approved',
    amountMinorUnits: submission.amountMinorUnits,
  });

  return submission;
}

export async function rejectSubmission(user, id, { reason }) {
  const submission = await PaymentSubmission.findById(id);
  if (!submission) throw ApiError.notFound('Payment submission not found');
  const hostelId = resolveHostelScope(user, submission.hostelId.toString());

  if (submission.status !== 'pending') {
    throw ApiError.conflict(
      `Only a pending submission can be rejected (current status: ${submission.status})`
    );
  }

  submission.status = 'rejected';
  submission.reviewedBy = user.id;
  submission.reviewedAt = new Date();
  submission.rejectionReason = reason;
  await submission.save();

  const resident = await Resident.findById(submission.residentId);
  notifyResidentOfReview(resident, { approved: false, submission, rejectionReason: reason });

  recordAuditLog({
    hostelId,
    actorId: user.id,
    action: 'payment_submission.rejected',
    entityType: 'PaymentSubmission',
    entityId: submission._id,
    metadata: { reason },
  });

  emitToHostel(hostelId, 'payment_submission:reviewed', {
    submissionId: submission._id,
    residentId: submission.residentId,
    status: 'rejected',
  });

  emitToResident(submission.residentId, 'payment_submission:reviewed', {
    submissionId: submission._id,
    invoiceId: submission.invoiceId,
    status: 'rejected',
    amountMinorUnits: submission.amountMinorUnits,
    rejectionReason: reason,
  });

  return submission;
}
