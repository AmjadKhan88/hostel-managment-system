import { Hostel } from '../models/Hostel.model.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';
import { uploadBufferToCloudinary, cloudinary } from '../config/cloudinary.js';
import { recordAuditLog } from './audit.service.js';

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function assertCanAccessHostel(user, hostelId) {
  const isSuperAdmin = user.permissions.includes(SUPER_ADMIN_WILDCARD);
  if (!isSuperAdmin && user.hostelId !== hostelId) {
    throw ApiError.forbidden('You can only access your own hostel');
  }
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

export async function getHostelById(user, id) {
  assertCanAccessHostel(user, id);
  const hostel = await Hostel.findById(id);
  if (!hostel) throw ApiError.notFound('Hostel not found');
  return hostel;
}

export async function updateHostel(user, id, data) {
  assertCanAccessHostel(user, id);
  const hostel = await Hostel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!hostel) throw ApiError.notFound('Hostel not found');

  recordAuditLog({
    hostelId: id,
    actorId: user.id,
    action: 'settings.updated',
    entityType: 'Hostel',
    entityId: hostel._id,
    metadata: { fields: Object.keys(data) },
  });

  return hostel;
}

export async function uploadHostelLogo(user, id, file) {
  assertCanAccessHostel(user, id);
  if (!file) throw ApiError.badRequest('No file was uploaded');

  const hostel = await Hostel.findById(id);
  if (!hostel) throw ApiError.notFound('Hostel not found');

  const result = await uploadBufferToCloudinary(file.buffer, {
    folder: `hostel-management/${id}/branding`,
    resource_type: 'image',
  });

  const previousPublicId = hostel.logoPublicId;

  hostel.logoUrl = result.secure_url;
  hostel.logoPublicId = result.public_id;
  await hostel.save();

  // Clean up the old logo now that the new one is saved successfully.
  if (previousPublicId) {
    await cloudinary.uploader.destroy(previousPublicId).catch(() => {});
  }

  return hostel;
}