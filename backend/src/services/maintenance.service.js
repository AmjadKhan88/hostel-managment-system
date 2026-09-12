import { MaintenanceTicket } from '../models/MaintenanceTicket.model.js';
import { Room } from '../models/Room.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

const RESOLVED_LIKE = ['resolved', 'closed'];

export async function createTicket(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const room = await Room.findById(data.roomId);
  if (!room) throw ApiError.notFound('Room not found');
  if (room.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('Room does not belong to this hostel');
  }

  return MaintenanceTicket.create({ ...data, hostelId, raisedBy: user.id });
}

export async function listTickets(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.roomId) filter.roomId = query.roomId;

  const [items, total] = await Promise.all([
    MaintenanceTicket.find(filter)
      .populate('assignedTo', 'name email')
      .populate('roomId', 'roomNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    MaintenanceTicket.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getTicketById(user, id) {
  const ticket = await MaintenanceTicket.findById(id)
    .populate('assignedTo', 'name email')
    .populate('roomId', 'roomNumber');
  if (!ticket) throw ApiError.notFound('Maintenance ticket not found');
  resolveHostelScope(user, ticket.hostelId.toString());
  return ticket;
}

export async function updateTicket(user, id, data) {
  const ticket = await getTicketById(user, id);

  if (data.assignedTo) {
    const assignee = await User.findById(data.assignedTo);
    if (!assignee) throw ApiError.badRequest('Assigned user not found');
    if (assignee.hostelId?.toString() !== ticket.hostelId.toString()) {
      throw ApiError.badRequest('Assigned user does not belong to this hostel');
    }
  }

  if (data.status) {
    const wasResolvedLike = RESOLVED_LIKE.includes(ticket.status);
    const willBeResolvedLike = RESOLVED_LIKE.includes(data.status);
    if (willBeResolvedLike && !wasResolvedLike) ticket.resolvedAt = new Date();
    else if (!willBeResolvedLike && wasResolvedLike) ticket.resolvedAt = null;
    ticket.status = data.status;
  }

  if (data.priority) ticket.priority = data.priority;
  if (data.assignedTo !== undefined) ticket.assignedTo = data.assignedTo || null;
  if (data.scheduledDate !== undefined) ticket.scheduledDate = data.scheduledDate;
  if (data.costMinorUnits !== undefined) ticket.costMinorUnits = data.costMinorUnits;
  if (data.notes !== undefined) ticket.notes = data.notes;

  await ticket.save();
  return getTicketById(user, id);
}