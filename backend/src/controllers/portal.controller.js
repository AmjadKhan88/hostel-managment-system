import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as portalService from '../services/portal.service.js';

export const listMyInvoices = asyncHandler(async (req, res) => {
  const result = await portalService.listMyInvoices(req.resident, req.query);
  new ApiResponse(200, result, 'Invoices fetched successfully').send(res);
});

export const getMyInvoice = asyncHandler(async (req, res) => {
  const invoice = await portalService.getMyInvoiceById(req.resident, req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice fetched successfully').send(res);
});

export const listMyPayments = asyncHandler(async (req, res) => {
  const result = await portalService.listMyPayments(req.resident, req.query);
  new ApiResponse(200, result, 'Payments fetched successfully').send(res);
});

export const listMyComplaints = asyncHandler(async (req, res) => {
  const result = await portalService.listMyComplaints(req.resident, req.query);
  new ApiResponse(200, result, 'Complaints fetched successfully').send(res);
});

export const getMyComplaint = asyncHandler(async (req, res) => {
  const complaint = await portalService.getMyComplaintById(req.resident, req.params.id);
  new ApiResponse(200, { complaint }, 'Complaint fetched successfully').send(res);
});

export const submitComplaint = asyncHandler(async (req, res) => {
  const complaint = await portalService.submitMyComplaint(req.resident, req.body);
  new ApiResponse(201, { complaint }, 'Complaint submitted successfully').send(res);
});

export const listMyNotices = asyncHandler(async (req, res) => {
  const result = await portalService.listMyNotices(req.resident, req.query);
  new ApiResponse(200, result, 'Notices fetched successfully').send(res);
});
