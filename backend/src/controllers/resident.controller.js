import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as residentService from '../services/resident.service.js';

export const createResident = asyncHandler(async (req, res) => {
  const resident = await residentService.createResident(req.user, req.body);
  new ApiResponse(201, { resident }, 'Resident created successfully').send(res);
});

export const listResidents = asyncHandler(async (req, res) => {
  const result = await residentService.listResidents(req.user, req.query);
  new ApiResponse(200, result, 'Residents fetched successfully').send(res);
});

export const getResident = asyncHandler(async (req, res) => {
  const resident = await residentService.getResidentById(req.user, req.params.id);
  new ApiResponse(200, { resident }, 'Resident fetched successfully').send(res);
});

export const updateResident = asyncHandler(async (req, res) => {
  const resident = await residentService.updateResident(req.user, req.params.id, req.body);
  new ApiResponse(200, { resident }, 'Resident updated successfully').send(res);
});