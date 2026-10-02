import { Resident } from '../models/Resident.model.js';
import { Bed } from '../models/Bed.model.js';
import { Invoice } from '../models/Invoice.model.js';
import { Payment } from '../models/Payment.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { Notice } from '../models/Notice.model.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { emitToHostel } from '../events/socketEvents.js';
import { recordAuditLog } from './audit.service.js';

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
