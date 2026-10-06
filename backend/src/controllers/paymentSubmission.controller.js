import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as paymentSubmissionService from '../services/paymentSubmission.service.js';

export const listSubmissions = asyncHandler(async (req, res) => {
  const result = await paymentSubmissionService.listSubmissions(req.user, req.query);
  new ApiResponse(200, result, 'Payment submissions fetched successfully').send(res);
});

export const getSubmission = asyncHandler(async (req, res) => {
  const submission = await paymentSubmissionService.getSubmissionById(req.user, req.params.id);
  new ApiResponse(200, { submission }, 'Payment submission fetched successfully').send(res);
});

export const approveSubmission = asyncHandler(async (req, res) => {
  const submission = await paymentSubmissionService.approveSubmission(req.user, req.params.id);
  new ApiResponse(200, { submission }, 'Payment approved successfully').send(res);
});

export const rejectSubmission = asyncHandler(async (req, res) => {
  const submission = await paymentSubmissionService.rejectSubmission(
    req.user,
    req.params.id,
    req.body
  );
  new ApiResponse(200, { submission }, 'Payment rejected').send(res);
});
