import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import * as paymentService from '../services/payment.service.js';

export const recordPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.recordPayment(req.user, req.body);
  new ApiResponse(201, { payment }, 'Payment recorded successfully').send(res);
});

export const listPayments = asyncHandler(async (req, res) => {
  const result = await paymentService.listPayments(req.user, req.query);
  new ApiResponse(200, result, 'Payments fetched successfully').send(res);
});

export const getPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.getPaymentById(req.user, req.params.id);
  new ApiResponse(200, { payment }, 'Payment fetched successfully').send(res);
});

export const refundPayment = asyncHandler(async (req, res) => {
  const payment = await paymentService.refundPayment(req.user, req.params.id, req.body);
  new ApiResponse(200, { payment }, 'Payment refunded successfully').send(res);
});