import { Complaint } from '../models/Complaint.model.js';
import { User } from '../models/User.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

const RESOLVED_LIKE = ['resolved', 'closed'];

export async function createComplaint(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  return Complaint.create({ ...data, hostelId, raisedBy: user.id });
}

export async function listComplaints(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.category) filter.category = query.category;
  if (query.assignedTo) filter.assignedTo = query.assignedTo;

  const [items, total] = await Promise.all([
    Complaint.find(filter)
      .populate('assignedTo', 'name email')
      .populate('residentId', 'name registrationNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Complaint.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getComplaintById(user, id) {
  const complaint = await Complaint.findById(id)
    .populate('assignedTo', 'name email')
    .populate('residentId', 'name registrationNumber')
    .populate('comments.authorId', 'name');
  if (!complaint) throw ApiError.notFound('Complaint not found');
  resolveHostelScope(user, complaint.hostelId.toString());
  return complaint;
}

export async function updateComplaint(user, id, data) {
  const complaint = await getComplaintById(user, id);

  if (data.assignedTo) {
    const assignee = await User.findById(data.assignedTo);
    if (!assignee) throw ApiError.badRequest('Assigned user not found');
    if (assignee.hostelId?.toString() !== complaint.hostelId.toString()) {
      throw ApiError.badRequest('Assigned user does not belong to this hostel');
    }
  }

  if (data.status) {
    const wasResolvedLike = RESOLVED_LIKE.includes(complaint.status);
    const willBeResolvedLike = RESOLVED_LIKE.includes(data.status);

    if (willBeResolvedLike && !wasResolvedLike) {
      complaint.resolvedAt = new Date();
    } else if (!willBeResolvedLike && wasResolvedLike) {
      complaint.resolvedAt = null;
    }
    complaint.status = data.status;
  }

  if (data.priority) complaint.priority = data.priority;
  if (data.assignedTo !== undefined) complaint.assignedTo = data.assignedTo || null;
  if (data.resolutionNotes !== undefined) complaint.resolutionNotes = data.resolutionNotes;

  await complaint.save();
  return getComplaintById(user, id);
}

export async function addComment(user, id, text) {
  const complaint = await getComplaintById(user, id);
  complaint.comments.push({ authorId: user.id, text });
  await complaint.save();
  return getComplaintById(user, id);
}