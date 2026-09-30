import { z } from 'zod';
import { FEE_TYPES, BILLING_CYCLES } from '../models/FeeStructure.model.js';
import { ROOM_CATEGORIES } from '../models/Room.model.js';

export const createFeeStructureSchema = z.object({
  hostelId: z.string().optional(),
  name: z.string().min(2).max(120),
  feeType: z.enum(FEE_TYPES),
  roomCategory: z.enum(ROOM_CATEGORIES).optional(),
  billingCycle: z.enum(BILLING_CYCLES).optional(),
  amountMinorUnits: z.coerce.number().int().min(0),
});

export const updateFeeStructureSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  feeType: z.enum(FEE_TYPES).optional(),
  roomCategory: z.enum(ROOM_CATEGORIES).nullable().optional(),
  billingCycle: z.enum(BILLING_CYCLES).optional(),
  amountMinorUnits: z.coerce.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});
