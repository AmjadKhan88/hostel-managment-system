import { z } from 'zod';
import { PAYMENT_METHODS } from '../models/Payment.model.js';

export const recordPaymentSchema = z.object({
  invoiceId: z.string().min(1, 'invoiceId is required'),
  amountMinorUnits: z.coerce.number().int().min(1),
  method: z.enum(PAYMENT_METHODS).optional(),
  notes: z.string().max(500).optional(),
});

export const refundPaymentSchema = z.object({
  reason: z.string().max(500).optional(),
});