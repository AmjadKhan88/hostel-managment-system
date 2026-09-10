import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as roomService from '../services/room.service.js';

export const createRoom = asyncHandler(async (req, res) => {
  const room = await roomService.createRoom(req.user, req.body);
  new ApiResponse(201, { room }, 'Room created successfully').send(res);
});

export const listRooms = asyncHandler(async (req, res) => {
  const result = await roomService.listRooms(req.user, req.query);
  new ApiResponse(200, result, 'Rooms fetched successfully').send(res);
});

export const getRoom = asyncHandler(async (req, res) => {
  const room = await roomService.getRoomById(req.user, req.params.id);
  new ApiResponse(200, { room }, 'Room fetched successfully').send(res);
});

export const updateRoom = asyncHandler(async (req, res) => {
  const room = await roomService.updateRoom(req.user, req.params.id, req.body);
  new ApiResponse(200, { room }, 'Room updated successfully').send(res);
});