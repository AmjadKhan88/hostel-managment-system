import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as noticeService from '../services/notice.service.js';

export const createNotice = asyncHandler(async (req, res) => {
  const notice = await noticeService.createNotice(req.user, req.body);
  new ApiResponse(201, { notice }, 'Notice created successfully').send(res);
});

export const listNotices = asyncHandler(async (req, res) => {
  const result = await noticeService.listNotices(req.user, req.query);
  new ApiResponse(200, result, 'Notices fetched successfully').send(res);
});

export const getNotice = asyncHandler(async (req, res) => {
  const notice = await noticeService.getNoticeById(req.user, req.params.id);
  new ApiResponse(200, { notice }, 'Notice fetched successfully').send(res);
});

export const updateNotice = asyncHandler(async (req, res) => {
  const notice = await noticeService.updateNotice(req.user, req.params.id, req.body);
  new ApiResponse(200, { notice }, 'Notice updated successfully').send(res);
});

export const deleteNotice = asyncHandler(async (req, res) => {
  await noticeService.deleteNotice(req.user, req.params.id);
  new ApiResponse(200, null, 'Notice deleted successfully').send(res);
});