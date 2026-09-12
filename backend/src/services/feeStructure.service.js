import { FeeStructure } from '../models/FeeStructure.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

export async function createFeeStructure(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const existing = await FeeStructure.findOne({ hostelId, name: data.name });
  if (existing) throw ApiError.conflict('A fee structure with this name already exists');

  return FeeStructure.create({ ...data, hostelId });
}

export async function listFeeStructures(user, hostelId) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');
  return FeeStructure.find({ hostelId: resolvedHostelId }).sort({ name: 1 });
}

export async function getFeeStructureById(user, id) {
  const fee = await FeeStructure.findById(id);
  if (!fee) throw ApiError.notFound('Fee structure not found');
  resolveHostelScope(user, fee.hostelId.toString());
  return fee;
}

export async function updateFeeStructure(user, id, data) {
  const fee = await getFeeStructureById(user, id);
  Object.assign(fee, data);
  await fee.save();
  return fee;
}