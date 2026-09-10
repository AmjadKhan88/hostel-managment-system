import { z } from 'zod';
import { ROOM_STATUSES, ROOM_CATEGORIES } from '../models/Room.model.js';

export const createRoomSchema = z.object({
  hostelId: z.string().optional(),
  buildingId: z.string().min(1, 'buildingId is required'),
  floorId: z.string().min(1, 'floorId is required'),
  roomNumber: z.string().min(1).max(20),
  category: z.enum(ROOM_CATEGORIES),
  capacity: z.number().int().min(1).max(20),
  amenities: z.array(z.string()).optional(),
});

export const updateRoomSchema = z.object({
  category: z.enum(ROOM_CATEGORIES).optional(),
  capacity: z.number().int().min(1).max(20).optional(),
  amenities: z.array(z.string()).optional(),
  status: z.enum(ROOM_STATUSES).optional(),
  isActive: z.boolean().optional(),
});