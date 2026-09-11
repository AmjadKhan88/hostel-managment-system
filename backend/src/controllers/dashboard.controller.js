import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as dashboardService from '../services/dashboard.service.js';

export const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getDashboardSummary(req.user, req.query.hostelId);
  new ApiResponse(200, summary, 'Dashboard summary fetched successfully').send(res);
});