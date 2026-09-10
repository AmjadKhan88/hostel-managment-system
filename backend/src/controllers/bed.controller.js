import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as bedService from '../services/bed.service.js';

export const createBed = asyncHandler(async (req, res) => {
  const bed = await bedService.createBed(req.user, req.params.roomId, req.body);
  new ApiResponse(201, { bed }, 'Bed created successfully').send(res);
});

export const listBeds = asyncHandler(async (req, res) => {
  const beds = await bedService.listBedsForRoom(req.user, req.params.roomId);
  new ApiResponse(200, { beds }, 'Beds fetched successfully').send(res);
});

export const updateBedStatus = asyncHandler(async (req, res) => {
  const bed = await bedService.updateBedStatus(
    req.user,
    req.params.roomId,
    req.params.bedId,
    req.body.status
  );
  new ApiResponse(200, { bed }, 'Bed status updated successfully').send(res);
});