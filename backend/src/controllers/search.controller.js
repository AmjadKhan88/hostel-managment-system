import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as searchService from '../services/search.service.js';

export const search = asyncHandler(async (req, res) => {
  const result = await searchService.globalSearch(req.user, req.query.hostelId, req.query.q);
  new ApiResponse(200, result, 'Search results fetched successfully').send(res);
});