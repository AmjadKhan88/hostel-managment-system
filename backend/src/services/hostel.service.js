import { Hostel } from '../models/Hostel.model.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function createHostel(data, actorUserId) {
  const slug = slugify(data.name);
  const existing = await Hostel.findOne({ slug });
  if (existing) throw ApiError.conflict('A hostel with a similar name already exists');

  return Hostel.create({ ...data, slug, ownerId: actorUserId });
}

export async function listHostels(query) {
  const { page, limit, skip } = parsePagination(query);
  const [items, total] = await Promise.all([
    Hostel.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    Hostel.countDocuments(),
  ]);
  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getHostelById(id) {
  const hostel = await Hostel.findById(id);
  if (!hostel) throw ApiError.notFound('Hostel not found');
  return hostel;
}

export async function updateHostel(id, data) {
  const hostel = await Hostel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!hostel) throw ApiError.notFound('Hostel not found');
  return hostel;
}