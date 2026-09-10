import { z } from 'zod';
import { ALL_PERMISSIONS } from '../constants/permissions.js';

export const createRoleSchema = z.object({
  hostelId: z.string().optional(),
  name: z.string().min(2).max(60),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).min(1, 'Select at least one permission'),
});

export const updateRoleSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  permissions: z.array(z.enum(ALL_PERMISSIONS)).min(1).optional(),
});