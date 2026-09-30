import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as automationService from '../services/automation.service.js';

export const getStatus = asyncHandler(async (req, res) => {
  const status = await automationService.getAutomationStatus(req.user, req.query.hostelId);
  new ApiResponse(200, status, 'Automation status fetched successfully').send(res);
});

export const retryJob = asyncHandler(async (req, res) => {
  const result = await automationService.retryJob(req.user, req.params.queue, req.params.jobId);
  new ApiResponse(200, result, 'Job queued for retry').send(res);
});
