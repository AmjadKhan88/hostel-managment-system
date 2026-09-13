import mongoose from 'mongoose';
import { Room } from '../models/Room.model.js';
import { Bed } from '../models/Bed.model.js';
import { Building } from '../models/Building.model.js';
import { Payment } from '../models/Payment.model.js';
import { Admission } from '../models/Admission.model.js';
import { Complaint } from '../models/Complaint.model.js';
import { MaintenanceTicket } from '../models/MaintenanceTicket.model.js';
import { Visitor } from '../models/Visitor.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

function toObjectId(id) {
  return new mongoose.Types.ObjectId(id);
}

function dateRangeFilter(from, to) {
  const filter = {};
  if (from) filter.$gte = new Date(from);
  if (to) filter.$lte = new Date(to);
  return Object.keys(filter).length ? filter : undefined;
}

export async function occupancyReport(user, hostelId) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');
  const hostelObjectId = toObjectId(resolvedHostelId);

  const [bedsByStatus, buildings, roomsByBuilding] = await Promise.all([
    Bed.aggregate([{ $match: { hostelId: hostelObjectId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Building.find({ hostelId: resolvedHostelId }),
    Room.aggregate([
      { $match: { hostelId: hostelObjectId } },
      { $group: { _id: { buildingId: '$buildingId', status: '$status' }, count: { $sum: 1 } } },
    ]),
  ]);

  const buildingMap = new Map(buildings.map((b) => [b._id.toString(), b.name]));
  const perBuilding = {};
  for (const row of roomsByBuilding) {
    const key = row._id.buildingId.toString();
    if (!perBuilding[key]) {
      perBuilding[key] = { buildingId: key, buildingName: buildingMap.get(key) ?? 'Unknown', total: 0, byStatus: {} };
    }
    perBuilding[key].byStatus[row._id.status] = row.count;
    perBuilding[key].total += row.count;
  }

  return {
    beds: Object.fromEntries(bedsByStatus.map((r) => [r._id, r.count])),
    buildings: Object.values(perBuilding),
  };
}

export async function feeCollectionReport(user, hostelId, { from, to }) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const range = dateRangeFilter(from, to);
  const findFilter = { hostelId: resolvedHostelId, status: 'completed' };
  if (range) findFilter.paidAt = range;

  const matchFilter = { ...findFilter, hostelId: toObjectId(resolvedHostelId) };

  const [byMethod, totalAgg, rows] = await Promise.all([
    Payment.aggregate([
      { $match: matchFilter },
      { $group: { _id: '$method', totalMinorUnits: { $sum: '$amountMinorUnits' }, count: { $sum: 1 } } },
    ]),
    Payment.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalMinorUnits: { $sum: '$amountMinorUnits' }, count: { $sum: 1 } } },
    ]),
    Payment.find(findFilter).populate('residentId', 'name registrationNumber').sort({ paidAt: -1 }).limit(500),
  ]);

  return {
    totalMinorUnits: totalAgg[0]?.totalMinorUnits ?? 0,
    paymentCount: totalAgg[0]?.count ?? 0,
    byMethod: byMethod.map((m) => ({ method: m._id, totalMinorUnits: m.totalMinorUnits, count: m.count })),
    rows: rows.map((p) => ({
      receiptNumber: p.receiptNumber,
      resident: p.residentId?.name ?? '',
      registrationNumber: p.residentId?.registrationNumber ?? '',
      amountMinorUnits: p.amountMinorUnits,
      method: p.method,
      paidAt: p.paidAt,
    })),
  };
}

export async function admissionsReport(user, hostelId, { from, to }) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const range = dateRangeFilter(from, to);
  const match = { hostelId: toObjectId(resolvedHostelId) };
  if (range) match.createdAt = range;

  const results = await Admission.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  return { byStatus: Object.fromEntries(results.map((r) => [r._id, r.count])) };
}

export async function complaintsReport(user, hostelId, { from, to }) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const range = dateRangeFilter(from, to);
  const match = { hostelId: toObjectId(resolvedHostelId) };
  if (range) match.createdAt = range;

  const [byStatus, byCategory] = await Promise.all([
    Complaint.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Complaint.aggregate([{ $match: match }, { $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  return {
    byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
    byCategory: Object.fromEntries(byCategory.map((r) => [r._id, r.count])),
  };
}

export async function maintenanceReport(user, hostelId, { from, to }) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const range = dateRangeFilter(from, to);
  const match = { hostelId: toObjectId(resolvedHostelId) };
  if (range) match.createdAt = range;

  const [byStatus, costAgg] = await Promise.all([
    MaintenanceTicket.aggregate([{ $match: match }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    MaintenanceTicket.aggregate([
      { $match: match },
      { $group: { _id: null, totalCostMinorUnits: { $sum: '$costMinorUnits' } } },
    ]),
  ]);

  return {
    byStatus: Object.fromEntries(byStatus.map((r) => [r._id, r.count])),
    totalCostMinorUnits: costAgg[0]?.totalCostMinorUnits ?? 0,
  };
}

export async function visitorsReport(user, hostelId, { from, to }) {
  const resolvedHostelId = resolveHostelScope(user, hostelId);
  if (!resolvedHostelId) throw ApiError.badRequest('hostelId is required');

  const range = dateRangeFilter(from, to);
  const filter = { hostelId: resolvedHostelId };
  if (range) filter.checkInAt = range;

  const rows = await Visitor.find(filter)
    .populate('residentId', 'name registrationNumber')
    .sort({ checkInAt: -1 })
    .limit(500);

  return {
    count: rows.length,
    rows: rows.map((v) => ({
      visitorName: v.visitorName,
      phone: v.phone,
      resident: v.residentId?.name ?? '',
      checkInAt: v.checkInAt,
      checkOutAt: v.checkOutAt ?? '',
    })),
  };
}