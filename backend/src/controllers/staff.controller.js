import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as staffService from '../services/staff.service.js';

export const createStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.createStaff(req.user, req.body);
  new ApiResponse(201, { staff }, 'Staff member created successfully').send(res);
});

export const listStaff = asyncHandler(async (req, res) => {
  const result = await staffService.listStaff(req.user, req.query);
  new ApiResponse(200, result, 'Staff fetched successfully').send(res);
});

export const getStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.getStaffById(req.user, req.params.id);
  new ApiResponse(200, { staff }, 'Staff member fetched successfully').send(res);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const staff = await staffService.updateStaff(req.user, req.params.id, req.body);
  new ApiResponse(200, { staff }, 'Staff member updated successfully').send(res);
});