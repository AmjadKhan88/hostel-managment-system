import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { recordAuditLog } from './audit.service.js';

export async function createResident(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const existing = await Resident.findOne({ hostelId, registrationNumber: data.registrationNumber });
  if (existing) {
    throw ApiError.conflict('A resident with this registration number already exists in this hostel');
  }

  const resident = await Resident.create({ ...data, hostelId });

  recordAuditLog({
    hostelId,
    actorId: user.id,
    action: 'resident.created',
    entityType: 'Resident',
    entityId: resident._id,
    metadata: { name: resident.name, registrationNumber: resident.registrationNumber },
  });

  return resident;
}

export async function listResidents(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status;
  if (query.unallocated === 'true') filter.currentBedId = null;
  if (query.search) {
    const regex = { $regex: query.search, $options: 'i' };
    filter.$or = [{ name: regex }, { email: regex }, { phone: regex }, { registrationNumber: regex }];
  }

  const [items, total] = await Promise.all([
    Resident.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resident.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getResidentById(user, id) {
  const resident = await Resident.findById(id);
  if (!resident) throw ApiError.notFound('Resident not found');
  resolveHostelScope(user, resident.hostelId.toString());
  return resident;
}

export async function updateResident(user, id, data) {
  const resident = await getResidentById(user, id);
  Object.assign(resident, data);
  await resident.save();

  recordAuditLog({
    hostelId: resident.hostelId.toString(),
    actorId: user.id,
    action: 'resident.updated',
    entityType: 'Resident',
    entityId: resident._id,
    metadata: { fields: Object.keys(data) },
  });

  return resident;
}