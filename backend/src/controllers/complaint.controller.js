import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as complaintService from '../services/complaint.service.js';

export const createComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.createComplaint(req.user, req.body);
  new ApiResponse(201, { complaint }, 'Complaint created successfully').send(res);
});

export const listComplaints = asyncHandler(async (req, res) => {
  const result = await complaintService.listComplaints(req.user, req.query);
  new ApiResponse(200, result, 'Complaints fetched successfully').send(res);
});

export const getComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.getComplaintById(req.user, req.params.id);
  new ApiResponse(200, { complaint }, 'Complaint fetched successfully').send(res);
});

export const updateComplaint = asyncHandler(async (req, res) => {
  const complaint = await complaintService.updateComplaint(req.user, req.params.id, req.body);
  new ApiResponse(200, { complaint }, 'Complaint updated successfully').send(res);
});

export const addComment = asyncHandler(async (req, res) => {
  const complaint = await complaintService.addComment(req.user, req.params.id, req.body.text);
  new ApiResponse(201, { complaint }, 'Comment added successfully').send(res);
});