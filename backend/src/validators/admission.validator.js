import { z } from 'zod';

export const createAdmissionSchema = z.object({
  hostelId: z.string().optional(),
  residentId: z.string().min(1, 'residentId is required'),
  requestedCategory: z.string().max(60).optional(),
});

export const decisionSchema = z.object({
  decisionNotes: z.string().max(1000).optional(),
});

export const checkInSchema = z.object({
  bedId: z.string().min(1, 'bedId is required'),
  securityDepositMinorUnits: z.coerce.number().int().min(0).optional(),
  initialPaymentMinorUnits: z.coerce.number().int().min(0).optional(),
});