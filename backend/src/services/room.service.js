import { Room } from '../models/Room.model.js';
import { Building } from '../models/Building.model.js';
import { ApiError } from '../utils/ApiError.js';
import { resolveHostelScope } from '../utils/hostelScope.js';
import { parsePagination, buildPaginatedResponse } from '../utils/pagination.js';

async function assertFloorBelongsToBuilding(buildingId, floorId) {
  const building = await Building.findById(buildingId);
  if (!building) throw ApiError.badRequest('Building not found');
  const floor = building.floors.id(floorId);
  if (!floor) throw ApiError.badRequest('Floor not found on this building');
  return building;
}

export async function createRoom(user, data) {
  const hostelId = resolveHostelScope(user, data.hostelId);
  if (!hostelId) throw ApiError.badRequest('hostelId is required');

  const building = await assertFloorBelongsToBuilding(data.buildingId, data.floorId);
  if (building.hostelId.toString() !== hostelId) {
    throw ApiError.badRequest('Building does not belong to this hostel');
  }

  const existing = await Room.findOne({ hostelId, roomNumber: data.roomNumber });
  if (existing) throw ApiError.conflict('A room with this number already exists in this hostel');

  return Room.create({ ...data, hostelId });
}

export async function listRooms(user, query) {
  const hostelId = resolveHostelScope(user, query.hostelId);
  const { page, limit, skip } = parsePagination(query);

  const filter = {};
  if (hostelId) filter.hostelId = hostelId;
  if (query.buildingId) filter.buildingId = query.buildingId;
  if (query.floorId) filter.floorId = query.floorId;
  if (query.status) filter.status = query.status;
  if (query.search) filter.roomNumber = { $regex: query.search, $options: 'i' };

  const [items, total] = await Promise.all([
    Room.find(filter).sort({ roomNumber: 1 }).skip(skip).limit(limit),
    Room.countDocuments(filter),
  ]);

  return buildPaginatedResponse({ items, total, page, limit });
}

export async function getRoomById(user, id) {
  const room = await Room.findById(id);
  if (!room) throw ApiError.notFound('Room not found');
  resolveHostelScope(user, room.hostelId.toString());
  return room;
}

export async function updateRoom(user, id, data) {
  const room = await getRoomById(user, id);
  Object.assign(room, data);
  await room.save();
  return room;
}