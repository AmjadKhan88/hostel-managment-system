import { Visitor } from '../models/Visitor.model.js';
import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

/** Staff walk-in registration — the visitor is physically here right now. */
export async function checkInVisitor(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const resident = await Resident.findById(data.residentId);
  if (!resident) throw ApiError.notFound('Resident not found');
  if (resident.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('Resident does not belong to this hostel');
  }

  return Visitor.create({
    hostelId,
    residentId: resident._id,
    visitorName: data.visitorName,
    phone: data.phone,
    purpose: data.purpose,
    status: 'inside',
    checkInAt: new Date(),
    registeredBy: user.id,
  });
}

/** Staff action: a pre-registered (status: 'expected') visitor has arrived. */
export async function checkInExpectedVisitor(user, id) {
  const visitor = await Visitor.findById(id);
  if (!visitor) throw ApiError.notFound('Visitor record not found');
  resolveHostelScope(user, visitor.hostelId.toString());

  if (visitor.status !== 'expected') {
    throw ApiError.conflict(
      `Only an expected visitor can be checked in (current status: ${visitor.status})`
    );
  }

  visitor.status = 'inside';
  visitor.checkInAt = new Date();
  await visitor.save();
  return visitor;
}

export async function checkOutVisitor(user, id) {
  const visitor = await Visitor.findById(id);
  if (!visitor) throw ApiError.notFound('Visitor record not found');
  resolveHostelScope(user, visitor.hostelId.toString());

  if (visitor.status !== 'inside') {
    throw ApiError.conflict(
      `Only a visitor who is inside can be checked out (current status: ${visitor.status})`
    );
  }

  visitor.status = 'checked_out';
  visitor.checkOutAt = new Date();
  await visitor.save();
  return visitor;
}

export async function listVisitors(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status; // 'expected' | 'inside' | 'checked_out' | 'cancelled'
  if (query.residentId) filter.residentId = query.residentId;
  if (query.search) {
    filter.$or = [
      { visitorName: { $regex: query.search, $options: 'i' } },
      { phone: { $regex: query.search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    Visitor.find(filter)
      .populate('residentId', 'name registrationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Visitor.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}
