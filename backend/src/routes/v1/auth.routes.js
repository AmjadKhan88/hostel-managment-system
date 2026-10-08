import { Router } from 'express';
import {
  login,
  refresh,
  logout,
  me,
  forgotPassword,
  resetPassword,
} from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import {
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../validators/auth.validator.js';
import { createRateLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later',
});

// Tighter than login — each request can send an email.
const forgotLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many reset requests, please try again later',
});

router.post('/login', loginLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

router.post(
  '/forgot-password',
  forgotLimiter,
  validate({ body: forgotPasswordSchema }),
  forgotPassword
);
router.post(
  '/reset-password',
  loginLimiter,
  validate({ body: resetPasswordSchema }),
  resetPassword
);

export default router;
