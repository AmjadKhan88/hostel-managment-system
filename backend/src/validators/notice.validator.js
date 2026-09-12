import { z } from 'zod';
import { NOTICE_AUDIENCES } from '../models/Notice.model.js';

export const createNoticeSchema = z.object({
  hostelId: z.string().optional(),
  title: z.string().min(3).max(160),
  body: z.string().min(3).max(5000),
  audience: z.enum(NOTICE_AUDIENCES).optional(),
  publishAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().optional(),
});

export const updateNoticeSchema = z.object({
  title: z.string().min(3).max(160).optional(),
  body: z.string().min(3).max(5000).optional(),
  audience: z.enum(NOTICE_AUDIENCES).optional(),
  publishAt: z.coerce.date().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
});