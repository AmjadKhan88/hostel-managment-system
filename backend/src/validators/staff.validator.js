import { z } from 'zod';

export const createStaffSchema = z.object({
  hostelId: z.string().optional(),
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8, 'Temporary password must be at least 8 characters'),
  roleId: z.string().min(1, 'roleId is required'),
});

export const updateStaffSchema = z.object({
  name: z.string().min(2).max(120).optional(),
  roleId: z.string().optional(),
  status: z.enum(['active', 'suspended']).optional(),
});