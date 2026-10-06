import { Hostel } from '../models/Hostel.model.js';
import { ApiError } from '../utils/ApiError.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';
import { SUPER_ADMIN_WILDCARD } from '../constants/permissions.js';
import { uploadBufferToCloudinary, cloudinary } from '../config/cloudinary.js';
import { recordAuditLog } from './audit.service.js';
import { upsertHostelJobSchedulers, removeHostelJobSchedulers } from '../jobs/queues.js';
import { logger } from '../config/logger.js';

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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

  const hostel = await Hostel.create({ ...data, slug, ownerId: actorUserId });

  // Best-effort: a Redis hiccup here shouldn't fail hostel creation itself —
  // worker boot also syncs every active hostel's schedulers, so a missed
  // schedule here self-heals the next time the worker restarts.
  upsertHostelJobSchedulers(hostel).catch((err) =>
    logger.error({ err, hostelId: hostel._id }, 'Failed to schedule jobs for new hostel')
  );

  return hostel;
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

  // Re-sync schedulers if the timezone or active status changed — this is
  // the whole point of the fix: a hostel that changes its timezone in
  // Settings gets its jobs rescheduled to match, not left on the old one.
  if ('timezone' in data || 'isActive' in data) {
    const resync = hostel.isActive
      ? upsertHostelJobSchedulers(hostel)
      : removeHostelJobSchedulers(hostel._id);
    resync.catch((err) => logger.error({ err, hostelId: id }, 'Failed to re-sync job schedulers'));
  }

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

  if (previousPublicId) {
    await cloudinary.uploader.destroy(previousPublicId).catch(() => {});
  }

  return hostel;
}

export async function addPaymentMethod(user, hostelId, data) {
  assertCanAccessHostel(user, hostelId);
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) throw ApiError.notFound('Hostel not found');

  hostel.paymentMethods.push(data);
  await hostel.save();

  recordAuditLog({
    hostelId,
    actorId: user.id,
    action: 'settings.updated',
    entityType: 'Hostel',
    entityId: hostel._id,
    metadata: { change: 'payment_method_added', label: data.label },
  });

  return hostel;
}

export async function updatePaymentMethod(user, hostelId, methodId, data) {
  assertCanAccessHostel(user, hostelId);
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) throw ApiError.notFound('Hostel not found');

  const method = hostel.paymentMethods.id(methodId);
  if (!method) throw ApiError.notFound('Payment method not found');

  Object.assign(method, data);
  await hostel.save();
  return hostel;
}

export async function removePaymentMethod(user, hostelId, methodId) {
  assertCanAccessHostel(user, hostelId);
  const hostel = await Hostel.findById(hostelId);
  if (!hostel) throw ApiError.notFound('Hostel not found');

  const method = hostel.paymentMethods.id(methodId);
  if (!method) throw ApiError.notFound('Payment method not found');

  method.deleteOne();
  await hostel.save();
  return hostel;
}
