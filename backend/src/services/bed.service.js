import { Bed } from '../models/Bed.model.js';
import { ApiError } from '../utils/ApiError.js';
import { getRoomById } from './room.service.js';

export async function createBed(user, roomId, data) {
  const room = await getRoomById(user, roomId); // also enforces hostel scoping

  const existingCount = await Bed.countDocuments({ roomId });
  if (existingCount >= room.capacity) {
    throw ApiError.badRequest('Room has already reached its bed capacity');
  }

  const duplicate = await Bed.findOne({ roomId, bedNumber: data.bedNumber });
  if (duplicate) throw ApiError.conflict('A bed with this number already exists in this room');

  return Bed.create({ hostelId: room.hostelId, roomId, bedNumber: data.bedNumber });
}

export async function listBedsForRoom(user, roomId) {
  await getRoomById(user, roomId); // enforces hostel scoping
  return Bed.find({ roomId }).sort({ bedNumber: 1 });
}

export async function updateBedStatus(user, roomId, bedId, status) {
  await getRoomById(user, roomId);
  const bed = await Bed.findOne({ _id: bedId, roomId });
  if (!bed) throw ApiError.notFound('Bed not found');

  if (bed.status === 'occupied' && status !== 'occupied' && bed.currentResidentId) {
    throw ApiError.conflict(
      'Cannot change status of an occupied bed without checking the resident out first'
    );
  }

  bed.status = status;
  await bed.save();
  return bed;
}