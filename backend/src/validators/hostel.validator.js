import { z } from 'zod';

export const createHostelSchema = z.object({
  name: z.string().min(2).max(120),
  timezone: z.string().optional(),
  currency: z.string().length(3).optional(),
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