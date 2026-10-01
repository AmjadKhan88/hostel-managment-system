import { z } from 'zod';

const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

export const loginResidentSchema = z.object({
  email: z.string().email('A valid email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const setupPortalAccountSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  token: z.string().min(1, 'token is required'),
  password: passwordSchema,
});

export const requestPasswordResetSchema = z.object({
  email: z.string().email('A valid email is required'),
});

export const resetPortalPasswordSchema = z.object({
  residentId: z.string().min(1, 'residentId is required'),
  token: z.string().min(1, 'token is required'),
  password: passwordSchema,
});
