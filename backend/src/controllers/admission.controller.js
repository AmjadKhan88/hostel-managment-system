import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as admissionService from '../services/admission.service.js';

export const createAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.createAdmission(req.user, req.body);
  new ApiResponse(201, { admission }, 'Admission application created successfully').send(res);
});

export const listAdmissions = asyncHandler(async (req, res) => {
  const result = await admissionService.listAdmissions(req.user, req.query);
  new ApiResponse(200, result, 'Admissions fetched successfully').send(res);
});

export const getAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.getAdmissionById(req.user, req.params.id);
  new ApiResponse(200, { admission }, 'Admission fetched successfully').send(res);
});

export const approveAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.approveAdmission(req.user, req.params.id, req.body);
  new ApiResponse(200, { admission }, 'Admission approved successfully').send(res);
});

export const rejectAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.rejectAdmission(req.user, req.params.id, req.body);
  new ApiResponse(200, { admission }, 'Admission rejected successfully').send(res);
});

export const waitlistAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.waitlistAdmission(req.user, req.params.id, req.body);
  new ApiResponse(200, { admission }, 'Admission waitlisted successfully').send(res);
});

export const verifyDocuments = asyncHandler(async (req, res) => {
  const admission = await admissionService.verifyDocuments(req.user, req.params.id);
  new ApiResponse(200, { admission }, 'Documents marked as verified').send(res);
});

export const checkInAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.checkInAdmission(req.user, req.params.id, req.body);
  new ApiResponse(200, { admission }, 'Resident checked in successfully').send(res);
});

export const cancelAdmission = asyncHandler(async (req, res) => {
  const admission = await admissionService.cancelAdmission(req.user, req.params.id);
  new ApiResponse(200, { admission }, 'Admission cancelled successfully').send(res);
});