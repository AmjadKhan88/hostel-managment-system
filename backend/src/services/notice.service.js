import { Notice } from '../models/Notice.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

export async function createNotice(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  return Notice.create({ ...data, hostelId, createdBy: user.id });
}

export async function listNotices(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.audience) filter.audience = query.audience;

  const [items, total] = await Promise.all([
    Notice.find(filter).sort({ publishAt: -1 }).skip(skip).limit(limit),
    Notice.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getNoticeById(user, id) {
  const notice = await Notice.findById(id);
  if (!notice) throw ApiError.notFound('Notice not found');
  resolveHostelScope(user, notice.hostelId.toString());
  return notice;
}

export async function updateNotice(user, id, data) {
  const notice = await getNoticeById(user, id);
  Object.assign(notice, data);
  await notice.save();
  return notice;
}

export async function deleteNotice(user, id) {
  const notice = await getNoticeById(user, id);
  await notice.deleteOne();
}