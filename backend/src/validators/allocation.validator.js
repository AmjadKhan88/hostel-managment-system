import { z } from 'zod';

export const allocateBedSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  bedId: z.string().min(1, 'bedId is required'),
  notes: z.string().max(500).optional(),
});

export const transferResidentSchema = z.object({
  newBedId: z.string().min(1, 'newBedId is required'),
  notes: z.string().max(500).optional(),
});