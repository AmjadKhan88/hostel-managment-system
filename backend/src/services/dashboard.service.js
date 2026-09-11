import mongoose from 'mongoose';
import { Bed } from '../models/Bed.model.js';
import { Room } from '../models/Room.model.js';
import { Resident } from '../models/Resident.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';

export async function getDashboardSummary(user, requestedHostelId) {
  const hostelId = resolveHostelScope(user, requestedHostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const hostelObjectId = new mongoose.Types.ObjectId(hostelId);

  const [occupancy, rooms, residents, admissionsTrend] = await Promise.all([
    getBedCounts(hostelObjectId),
    getRoomCounts(hostelObjectId),
    getResidentCounts(hostelObjectId),
    getAdmissionsTrend(hostelObjectId),
  ]);

  return { occupancy, rooms, residents, admissionsTrend };
}

async function countByStatus(Model, hostelObjectId) {
  const results = await Model.aggregate([
    { $match: { hostelId: hostelObjectId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const byStatus = Object.fromEntries(results.map((r) => [r._id, r.count]));
  const total = results.reduce((sum, r) => sum + r.count, 0);
  return { byStatus, total };
}

async function getBedCounts(hostelObjectId) {
  const { byStatus, total } = await countByStatus(Bed, hostelObjectId);
  const occupiedBeds = byStatus.occupied ?? 0;

  return {
    totalBeds: total,
    availableBeds: byStatus.available ?? 0,
    occupiedBeds,
    maintenanceBeds: byStatus.maintenance ?? 0,
    occupancyRate: total > 0 ? Math.round((occupiedBeds / total) * 1000) / 10 : 0,
  };
}

async function getRoomCounts(hostelObjectId) {
  const { byStatus, total } = await countByStatus(Room, hostelObjectId);
  return {
    total,
    available: byStatus.available ?? 0,
    occupied: byStatus.occupied ?? 0,
    maintenance: byStatus.maintenance ?? 0,
    inactive: byStatus.inactive ?? 0,
  };
}

async function getResidentCounts(hostelObjectId) {
  const { byStatus, total } = await countByStatus(Resident, hostelObjectId);
  return {
    total,
    active: byStatus.active ?? 0,
    pending: byStatus.pending ?? 0,
    checkedOut: byStatus.checked_out ?? 0,
  };
}

async function getAdmissionsTrend(hostelObjectId) {
  const since = new Date();
  since.setDate(since.getDate() - 29); // last 30 days including today
  since.setHours(0, 0, 0, 0);

  const results = await Resident.aggregate([
    { $match: { hostelId: hostelObjectId, createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);

  const byDate = Object.fromEntries(results.map((r) => [r._id, r.count]));
  const trend = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    trend.push({ date: key, count: byDate[key] ?? 0 });
  }
  return trend;
}