import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * General-purpose limiter applied to the whole API.
 * Stricter, endpoint-specific limiters (e.g. login) are added on the days
 * those routes are implemented.
 */
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(ApiError.tooMany('Too many requests, please try again later'));
  },
});

export function createRateLimiter({ windowMs, max, message }) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(ApiError.tooMany(message ?? 'Too many requests, please try again later'));
    },
  });
}
