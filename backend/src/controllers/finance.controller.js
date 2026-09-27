import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as financeService from '../services/finance.service.js';

export const getFinancialOverview = asyncHandler(async (req, res) => {
  const overview = await financeService.getFinancialOverview(req.user, req.query.hostelId, {
    month: req.query.month,
  });
  new ApiResponse(200, overview, 'Financial overview fetched successfully').send(res);
});
