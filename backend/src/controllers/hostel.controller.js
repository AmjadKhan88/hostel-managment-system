import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as hostelService from '../services/hostel.service.js';

export const createHostel = asyncHandler(async (req, res) => {
  const hostel = await hostelService.createHostel(req.body, req.user.id);
  new ApiResponse(201, { hostel }, 'Hostel created successfully').send(res);
});

export const listHostels = asyncHandler(async (req, res) => {
  const result = await hostelService.listHostels(req.query);
  new ApiResponse(200, result, 'Hostels fetched successfully').send(res);
});

export const getHostel = asyncHandler(async (req, res) => {
  const hostel = await hostelService.getHostelById(req.params.id);
  new ApiResponse(200, { hostel }, 'Hostel fetched successfully').send(res);
});

export const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await hostelService.updateHostel(req.params.id, req.body);
  new ApiResponse(200, { hostel }, 'Hostel updated successfully').send(res);
});