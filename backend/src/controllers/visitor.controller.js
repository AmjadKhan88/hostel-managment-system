import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as visitorService from '../services/visitor.service.js';

export const checkInVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.checkInVisitor(req.user, req.body);
  new ApiResponse(201, { visitor }, 'Visitor checked in successfully').send(res);
});

export const checkOutVisitor = asyncHandler(async (req, res) => {
  const visitor = await visitorService.checkOutVisitor(req.user, req.params.id);
  new ApiResponse(200, { visitor }, 'Visitor checked out successfully').send(res);
});

export const listVisitors = asyncHandler(async (req, res) => {
  const result = await visitorService.listVisitors(req.user, req.query);
  new ApiResponse(200, result, 'Visitors fetched successfully').send(res);
});