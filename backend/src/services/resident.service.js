import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

export async function createResident(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const existing = await Resident.findOne({ hostelId, registrationNumber: data.registrationNumber });
  if (existing) {
    throw ApiError.conflict('A resident with this registration number already exists in this hostel');
  }

  return Resident.create({ ...data, hostelId });
}

export async function listResidents(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status;
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
  return resident;
}