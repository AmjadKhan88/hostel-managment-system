import { z } from 'zod';
import { PAYMENT_METHODS } from '../models/Payment.model.js';

export const createPaymentSubmissionSchema = z.object({
  invoiceId: z.string().min(1, 'invoiceId is required'),
  amountMinorUnits: z.coerce.number().int().min(1),
  method: z.enum(PAYMENT_METHODS),
  paidToLabel: z.string().max(100).optional(),
  transactionReference: z.string().max(200).optional(),
});

export const rejectSubmissionSchema = z.object({
  reason: z.string().min(3, 'A rejection reason is required').max(500),
});
