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
  const hostel = await hostelService.getHostelById(req.user, req.params.id);
  new ApiResponse(200, { hostel }, 'Hostel fetched successfully').send(res);
});

export const updateHostel = asyncHandler(async (req, res) => {
  const hostel = await hostelService.updateHostel(req.user, req.params.id, req.body);
  new ApiResponse(200, { hostel }, 'Hostel updated successfully').send(res);
});

export const uploadLogo = asyncHandler(async (req, res) => {
  const hostel = await hostelService.uploadHostelLogo(req.user, req.params.id, req.file);
  new ApiResponse(200, { hostel }, 'Logo uploaded successfully').send(res);
});

export const addPaymentMethod = asyncHandler(async (req, res) => {
  const hostel = await hostelService.addPaymentMethod(req.user, req.params.id, req.body);
  new ApiResponse(201, { hostel }, 'Payment method added successfully').send(res);
});

export const updatePaymentMethod = asyncHandler(async (req, res) => {
  const hostel = await hostelService.updatePaymentMethod(
    req.user,
    req.params.id,
    req.params.methodId,
    req.body
  );
  new ApiResponse(200, { hostel }, 'Payment method updated successfully').send(res);
});

export const removePaymentMethod = asyncHandler(async (req, res) => {
  const hostel = await hostelService.removePaymentMethod(
    req.user,
    req.params.id,
    req.params.methodId
  );
  new ApiResponse(200, { hostel }, 'Payment method removed successfully').send(res);
});
