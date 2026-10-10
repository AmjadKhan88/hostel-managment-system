import { Resident } from '../models/Resident.model.js';
import { Bed } from '../models/Bed.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { Payment } from '../models/Payment.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { Notice } from '../models/Notice.model.js';
import { Document } from '../models/Document.model.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { emitToHostel } from '../events/socketEvents.js';
import { recordAuditLog } from './audit.service.js';
import { uploadBufferToCloudinary, cloudinary } from '../config/cloudinary.js';
import { MaintenanceTicket } from '../models/MaintenanceTicket.model.js';
import { Visitor } from '../models/Visitor.model.js';
import { Hostel } from '../models/Hostel.model.js';
import * as paymentSubmissionService from './paymentSubmission.service.js';
// ---- Invoices ----

export async function listMyInvoices(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId: residentAuth.hostelId, residentId: residentAuth.id };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Invoice.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getMyInvoiceById(residentAuth, invoiceId) {
  const invoice = await Invoice.findOne({
    _id: invoiceId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!invoice) throw ApiError.notFound('Invoice not found');
  return invoice;
}

// ---- Payments ----

export async function listMyPayments(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId: residentAuth.hostelId, residentId: residentAuth.id };

  const [items, total] = await Promise.all([
    Payment.find(filter).sort({ paidAt: -1 }).skip(skip).limit(limit),
    Payment.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

// ---- Complaints ----

export async function listMyComplaints(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId: residentAuth.hostelId, residentId: residentAuth.id };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getMyComplaintById(residentAuth, complaintId) {
  const complaint = await Complaint.findOne({
    _id: complaintId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  })
    .populate('assignedTo', 'name')
    .populate('comments.authorId', 'name');
  if (!complaint) throw ApiError.notFound('Complaint not found');
  return complaint;
}

/**
 * hostelId/residentId come from the resident's own authenticated token,
 * never from the request body — a resident cannot submit a complaint "as"
 * someone else or into a hostel they don't belong to.
 */
export async function submitMyComplaint(residentAuth, data) {
  const resident = await Resident.findById(residentAuth.id);
  if (!resident) throw ApiError.notFound('Resident not found');

  // Best-effort convenience: auto-attach the resident's current room so
  // staff don't have to ask which room it's about. Not required — a
  // resident between beds can still file a complaint.
  let roomId = null;
  if (resident.currentBedId) {
    const bed = await Bed.findById(resident.currentBedId).select('roomId');
    roomId = bed?.roomId ?? null;
  }

  const complaint = await Complaint.create({
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
    roomId,
    raisedBy: null,
    subject: data.subject,
    description: data.description,
    category: data.category,
    priority: data.priority ?? 'medium',
  });

  // Reuses the exact same real-time event staff-submitted complaints emit
  // (Day 29) — staff see a portal complaint appear live, identically.
  emitToHostel(residentAuth.hostelId, 'complaint:created', {
    complaintId: complaint._id,
    subject: complaint.subject,
  });

  recordAuditLog({
    hostelId: residentAuth.hostelId,
    actorId: null,
    actorName: resident.name,
    action: 'complaint.created',
    entityType: 'Complaint',
    entityId: complaint._id,
    metadata: { subject: complaint.subject, submittedByResident: true },
  });

  return complaint;
}

// ---- Notices ----

export async function listMyNotices(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const now = new Date();

  const filter = {
    hostelId: residentAuth.hostelId,
    audience: { $in: ['everyone', 'residents'] },
    publishAt: { $lte: now },
    $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
  };

  const [items, total] = await Promise.all([
    Notice.find(filter).sort({ publishAt: -1 }).skip(skip).limit(limit),
    Notice.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

// ---- Profile ----

export async function getMyProfile(residentAuth) {
  const resident = await Resident.findById(residentAuth.id);
  if (!resident) throw ApiError.notFound('Resident not found');
  return resident;
}

const EDITABLE_PROFILE_FIELDS = ['phone', 'guardian'];

export async function updateMyProfile(residentAuth, data) {
  const resident = await Resident.findById(residentAuth.id);
  if (!resident) throw ApiError.notFound('Resident not found');

  for (const field of EDITABLE_PROFILE_FIELDS) {
    if (data[field] !== undefined) resident[field] = data[field];
  }
  await resident.save();

  recordAuditLog({
    hostelId: residentAuth.hostelId,
    actorId: null,
    actorName: resident.name,
    action: 'resident.updated',
    entityType: 'Resident',
    entityId: resident._id,
    metadata: { fields: Object.keys(data), updatedByResident: true },
  });

  return resident;
}

// ---- Documents ----

export async function listMyDocuments(residentAuth) {
  return Document.find({ hostelId: residentAuth.hostelId, residentId: residentAuth.id }).sort({
    createdAt: -1,
  });
}

export async function uploadMyDocument(residentAuth, file, { fileType }) {
  if (!file) throw ApiError.badRequest('No file was uploaded');

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: `hostel-management/${residentAuth.hostelId}/residents/${residentAuth.id}`,
    resource_type: 'auto',
  });

  try {
    return await Document.create({
      hostelId: residentAuth.hostelId,
      residentId: residentAuth.id,
      fileType,
      originalFileName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      url: result.secure_url,
      publicId: result.public_id,
      uploadedBy: null, // self-uploaded, not a staff action
    });
  } catch (err) {
    // The Cloudinary upload already succeeded — clean it up if the DB
    // write failed, same pattern as the staff-side upload (Day 25).
    await cloudinary.uploader.destroy(result.public_id).catch(() => {});
    throw err;
  }
}

export async function deleteMyDocument(residentAuth, documentId) {
  const doc = await Document.findOne({
    _id: documentId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!doc) throw ApiError.notFound('Document not found');

  await cloudinary.uploader.destroy(doc.publicId).catch(() => {});
  await doc.deleteOne();
}

// ---- Maintenance requests ----

export async function listMyMaintenanceTickets(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId: residentAuth.hostelId, residentId: residentAuth.id };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    MaintenanceTicket.find(filter)
      .populate('assignedTo', 'name')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MaintenanceTicket.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getMyMaintenanceTicketById(residentAuth, ticketId) {
  const ticket = await MaintenanceTicket.findOne({
    _id: ticketId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  })
    .populate('assignedTo', 'name')
    .populate('roomId', 'roomNumber');
  if (!ticket) throw ApiError.notFound('Maintenance request not found');
  return ticket;
}

/**
 * A maintenance ticket is always tied to a room (required on the model) —
 * resolved from the resident's current bed, same lookup pattern as
 * submitMyComplaint. Unlike a complaint, there's no sensible "no room"
 * fallback here, so a resident with no current bed is told plainly why
 * they can't submit one, rather than silently failing or guessing a room.
 */
export async function submitMyMaintenanceRequest(residentAuth, data) {
  const resident = await Resident.findById(residentAuth.id);
  if (!resident) throw ApiError.notFound('Resident not found');
  if (!resident.currentBedId) {
    throw ApiError.badRequest(
      'You need an assigned room to submit a maintenance request — contact staff'
    );
  }

  const bed = await Bed.findById(resident.currentBedId).select('roomId');
  if (!bed) throw ApiError.badRequest('Your assigned bed could not be found — contact staff');

  const ticket = await MaintenanceTicket.create({
    hostelId: residentAuth.hostelId,
    roomId: bed.roomId,
    residentId: residentAuth.id,
    raisedBy: null,
    title: data.title,
    description: data.description,
    category: data.category,
  });

  emitToHostel(residentAuth.hostelId, 'maintenance:created', {
    ticketId: ticket._id,
    title: ticket.title,
  });

  recordAuditLog({
    hostelId: residentAuth.hostelId,
    actorId: null,
    actorName: resident.name,
    action: 'maintenance.created',
    entityType: 'MaintenanceTicket',
    entityId: ticket._id,
    metadata: { title: ticket.title, submittedByResident: true },
  });

  return ticket;
}

// ---- Visitor pre-registration ----

export async function listMyVisitorPreRegistrations(residentAuth, query) {
  const { page, limit, skip } = parsePagination(query);
  const filter = { hostelId: residentAuth.hostelId, residentId: residentAuth.id };
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Visitor.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Visitor.countDocuments(filter),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

export async function preRegisterMyVisitor(residentAuth, data) {
  const resident = await Resident.findById(residentAuth.id).select('name');

  const visitor = await Visitor.create({
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
    visitorName: data.visitorName,
    phone: data.phone,
    purpose: data.purpose,
    status: 'expected',
    expectedAt: data.expectedAt,
    registeredBy: null,
  });

  emitToHostel(residentAuth.hostelId, 'visitor:expected', {
    visitorId: visitor._id,
    visitorName: visitor.visitorName,
    residentName: resident?.name ?? 'A resident',
  });

  return visitor;
}

/** A resident can cancel their own pre-registration before the visitor arrives. */
export async function cancelMyVisitorPreRegistration(residentAuth, visitorId) {
  const visitor = await Visitor.findOne({
    _id: visitorId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!visitor) throw ApiError.notFound('Visitor record not found');
  if (visitor.status !== 'expected') {
    throw ApiError.conflict(
      `Only an expected (not-yet-arrived) visitor can be cancelled (current status: ${visitor.status})`
    );
  }

  visitor.status = 'cancelled';
  await visitor.save();

  const resident = await Resident.findById(residentAuth.id).select('name');
  emitToHostel(residentAuth.hostelId, 'visitor:cancelled', {
    visitorId: visitor._id,
    visitorName: visitor.visitorName,
    residentName: resident?.name ?? 'A resident',
  });

  return visitor;
}

// ---- Payment methods (for display when paying) ----

export async function getMyHostelPaymentMethods(residentAuth) {
  const hostel = await Hostel.findById(residentAuth.hostelId).select('paymentMethods currency');
  if (!hostel) throw ApiError.notFound('Hostel not found');
  return {
    currency: hostel.currency,
    paymentMethods: hostel.paymentMethods.filter((m) => m.isActive),
  };
}

// ---- Payment submissions (manual payment proof) ----

export function submitMyPaymentProof(residentAuth, body, file) {
  return paymentSubmissionService.createSubmission(residentAuth, body, file);
}

export function listMyPaymentSubmissions(residentAuth, query) {
  return paymentSubmissionService.listMySubmissions(residentAuth, query);
}

const MAX_COMMENTS_PER_COMPLAINT = 200;

export async function addMyComplaintComment(residentAuth, complaintId, text) {
  const complaint = await Complaint.findOne({
    _id: complaintId,
    hostelId: residentAuth.hostelId,
    residentId: residentAuth.id,
  });
  if (!complaint) throw ApiError.notFound('Complaint not found');
  if (complaint.status === 'closed') {
    throw ApiError.conflict('This complaint is closed — submit a new one if the problem continues');
  }
  if (complaint.comments.length >= MAX_COMMENTS_PER_COMPLAINT) {
    throw ApiError.badRequest(
      'This conversation has reached its comment limit — please contact staff'
    );
  }

  complaint.comments.push({ residentId: residentAuth.id, text });
  await complaint.save();

  const resident = await Resident.findById(residentAuth.id).select('name');
  emitToHostel(residentAuth.hostelId, 'complaint:commented', {
    complaintId: complaint._id,
    subject: complaint.subject,
    residentName: resident?.name ?? 'A resident',
  });

  return getMyComplaintById(residentAuth, complaintId);
}
