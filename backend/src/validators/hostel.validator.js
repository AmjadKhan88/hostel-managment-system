import { z } from 'zod';
import { PAYMENT_METHOD_TYPES } from '../models/Hostel.model.js';
export const createHostelSchema = z.object({
  name: z.string().min(2).max(120),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
  invoicePrefix: z.string().min(1).max(10).optional(),
  defaultDueDays: z.coerce.number().int().min(0).max(90).optional(),
  address: z
    .object({
      line1: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      postalCode: z.string().optional(),
    })
    .optional(),
});

export const updateHostelSchema = createHostelSchema.partial();

export const createPaymentMethodSchema = z.object({
  type: z.enum(PAYMENT_METHOD_TYPES),
  label: z.string().min(2).max(80),
  accountName: z.string().min(2),
  accountNumber: z.string().min(3),
  bankName: z.string().max(80).optional(),
  instructions: z.string().max(300).optional(),
});

export const updatePaymentMethodSchema = createPaymentMethodSchema.partial().extend({
  isActive: z.boolean().optional(),
});
