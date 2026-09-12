import { Admission } from '../models/Admission.model.js';
import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import * as allocationService from './allocation.service.js';

const DECIDABLE_FROM = ['applied', 'waitlisted'];
const TERMINAL = ['rejected', 'checked_in', 'cancelled'];

export async function createAdmission(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const resident = await Resident.findById(data.residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  if (resident.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('Resident does not belong to this hostel');
  }
  if (resident.status !== 'pending') {
    throw ApiError.conflict('An admission can only be started for a resident with "pending" status');
  }

  try {
    return await Admission.create({
      hostelId,
      residentId: resident._id,
      requestedCategory: data.requestedCategory,
      createdBy: user.id,
    });
  } catch (err) {
    if (err?.code === 11000) {
      throw ApiError.conflict('An admission record already exists for this resident');
    }
    throw err;
  }
}

export async function listAdmissions(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status;

  const [items, total] = await Promise.all([
    Admission.find(filter)
      .populate('residentId', 'name registrationNumber phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Admission.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getAdmissionById(user, id) {
  const admission = await Admission.findById(id).populate('residentId', 'name registrationNumber phone email');
  if (!admission) throw ApiError.notFound('Admission not found');
  resolveHostelScope(user, admission.hostelId.toString());
  return admission;
}

function assertDecidable(admission) {
  if (!DECIDABLE_FROM.includes(admission.status)) {
    throw ApiError.conflict(`Cannot make a decision on an admission with status "${admission.status}"`);
  }
}

export async function approveAdmission(user, id, { decisionNotes }) {
  const admission = await getAdmissionById(user, id);
  assertDecidable(admission);

  admission.status = 'approved';
  admission.decisionNotes = decisionNotes ?? admission.decisionNotes;
  admission.decidedBy = user.id;
  admission.decidedAt = new Date();
  await admission.save();
  return admission;
}

export async function rejectAdmission(user, id, { decisionNotes }) {
  const admission = await getAdmissionById(user, id);
  assertDecidable(admission);

  admission.status = 'rejected';
  admission.decisionNotes = decisionNotes ?? admission.decisionNotes;
  admission.decidedBy = user.id;
  admission.decidedAt = new Date();
  await admission.save();
  return admission;
}

export async function waitlistAdmission(user, id, { decisionNotes }) {
  const admission = await getAdmissionById(user, id);
  if (admission.status !== 'applied') {
    throw ApiError.conflict('Only a newly applied admission can be waitlisted');
  }

  admission.status = 'waitlisted';
  admission.decisionNotes = decisionNotes ?? admission.decisionNotes;
  await admission.save();
  return admission;
}

export async function verifyDocuments(user, id) {
  const admission = await getAdmissionById(user, id);
  admission.documentsVerified = true;
  await admission.save();
  return admission;
}

export async function checkInAdmission(user, id, { bedId, securityDepositMinorUnits, initialPaymentMinorUnits }) {
  const admission = await getAdmissionById(user, id);

  if (admission.status !== 'approved') {
    throw ApiError.conflict('Only an approved admission can be checked in');
  }

  // The one place Admissions and Room Allocation meet — reuses the exact
  // same service as the standalone allocation flow, so there's a single
  // code path for "a resident gets a bed," not two.
  const allocation = await allocationService.allocateBed(user, {
    residentId: admission.residentId,
    bedId,
    notes: `Checked in via admission ${admission._id}`,
  });

  admission.status = 'checked_in';
  admission.checkedInAt = new Date();
  admission.allocationId = allocation._id;
  if (securityDepositMinorUnits !== undefined) admission.securityDepositMinorUnits = securityDepositMinorUnits;
  if (initialPaymentMinorUnits !== undefined) admission.initialPaymentMinorUnits = initialPaymentMinorUnits;
  await admission.save();
  return admission;
}

export async function cancelAdmission(user, id) {
  const admission = await getAdmissionById(user, id);
  if (TERMINAL.includes(admission.status)) {
    throw ApiError.conflict(`Cannot cancel an admission with status "${admission.status}"`);
  }
  admission.status = 'cancelled';
  await admission.save();
  return admission;
}