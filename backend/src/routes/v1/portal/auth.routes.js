import { Router } from 'express';
import { authenticateResident } from '../../../middlewares/authenticateResident.js';
import { validate } from '../../../middlewares/validate.js';
import { createRateLimiter } from '../../../middlewares/rateLimiter.js';
import {
  loginResidentSchema,
  setupPortalAccountSchema,
  requestPasswordResetSchema,
  resetPortalPasswordSchema,
} from '../../../validators/residentAuth.validator.js';
import * as residentAuthController from '../../../controllers/residentAuth.controller.js';

const router = Router();

// Tighter limiter than staff login (§16 pattern) — this is a second,
// independent login surface and deserves the same brute-force protection.
const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many attempts, please try again later',
});

router.post(
  '/login',
  authLimiter,
  validate({ body: loginResidentSchema }),
  residentAuthController.login
);
router.post('/refresh', residentAuthController.refresh);
router.post('/logout', residentAuthController.logout);
router.get('/me', authenticateResident, residentAuthController.me);

router.post(
  '/setup-account',
  authLimiter,
  validate({ body: setupPortalAccountSchema }),
  residentAuthController.setupAccount
);
router.post(
  '/request-password-reset',
  authLimiter,
  validate({ body: requestPasswordResetSchema }),
  residentAuthController.requestPasswordReset
);
router.post(
  '/reset-password',
  authLimiter,
  validate({ body: resetPortalPasswordSchema }),
  residentAuthController.resetPassword
);

export default router;
