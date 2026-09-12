import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as invoiceService from '../services/invoice.service.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.createInvoice(req.user, req.body);
  new ApiResponse(201, { invoice }, 'Invoice created successfully').send(res);
});

export const listInvoices = asyncHandler(async (req, res) => {
  const result = await invoiceService.listInvoices(req.user, req.query);
  new ApiResponse(200, result, 'Invoices fetched successfully').send(res);
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.user, req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice fetched successfully').send(res);
});

export const voidInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.voidInvoice(req.user, req.params.id);
  new ApiResponse(200, { invoice }, 'Invoice voided successfully').send(res);
});

export const getOutstandingBalances = asyncHandler(async (req, res) => {
  const balances = await invoiceService.getOutstandingBalances(req.user, req.query.hostelId);
  new ApiResponse(200, { balances }, 'Outstanding balances fetched successfully').send(res);
});