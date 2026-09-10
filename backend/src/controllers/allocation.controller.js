import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as allocationService from '../services/allocation.service.js';

export const allocateBed = asyncHandler(async (req, res) => {
  const allocation = await allocationService.allocateBed(req.user, req.body);
  new ApiResponse(201, { allocation }, 'Bed allocated successfully').send(res);
});

export const transferResident = asyncHandler(async (req, res) => {
  const allocation = await allocationService.transferResident(req.user, req.params.residentId, req.body);
  new ApiResponse(200, { allocation }, 'Resident transferred successfully').send(res);
});

export const checkoutResident = asyncHandler(async (req, res) => {
  const allocation = await allocationService.checkoutResident(req.user, req.params.residentId);
  new ApiResponse(200, { allocation }, 'Resident checked out successfully').send(res);
});

export const listAllocationHistory = asyncHandler(async (req, res) => {
  const allocations = await allocationService.listAllocationHistoryForResident(req.user, req.params.residentId);
  new ApiResponse(200, { allocations }, 'Allocation history fetched successfully').send(res);
});