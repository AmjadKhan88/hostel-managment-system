import { z } from 'zod';
import { BED_STATUSES } from '../models/Bed.model.js';

export const createBedSchema = z.object({
  bedNumber: z.string().min(1).max(20),
});

export const updateBedStatusSchema = z.object({
  status: z.enum(BED_STATUSES),
});