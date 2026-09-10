import { z } from 'zod';

export const createBuildingSchema = z.object({
  hostelId: z.string().optional(), // optional for non-super-admins; resolved server-side
  name: z.string().min(1).max(120),
  floors: z.array(z.object({ name: z.string().min(1), order: z.number().optional() })).optional(),
});

export const updateBuildingSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  isActive: z.boolean().optional(),
});

export const addFloorSchema = z.object({
  name: z.string().min(1).max(60),
  order: z.number().optional(),
});