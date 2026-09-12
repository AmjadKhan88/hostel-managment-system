import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as feeStructureService from '../services/feeStructure.service.js';

export const createFeeStructure = asyncHandler(async (req, res) => {
  const feeStructure = await feeStructureService.createFeeStructure(req.user, req.body);
  new ApiResponse(201, { feeStructure }, 'Fee structure created successfully').send(res);
});

export const listFeeStructures = asyncHandler(async (req, res) => {
  const feeStructures = await feeStructureService.listFeeStructures(req.user, req.query.hostelId);
  new ApiResponse(200, { feeStructures }, 'Fee structures fetched successfully').send(res);
});

export const getFeeStructure = asyncHandler(async (req, res) => {
  const feeStructure = await feeStructureService.getFeeStructureById(req.user, req.params.id);
  new ApiResponse(200, { feeStructure }, 'Fee structure fetched successfully').send(res);
});

export const updateFeeStructure = asyncHandler(async (req, res) => {
  const feeStructure = await feeStructureService.updateFeeStructure(req.user, req.params.id, req.body);
  new ApiResponse(200, { feeStructure }, 'Fee structure updated successfully').send(res);
});