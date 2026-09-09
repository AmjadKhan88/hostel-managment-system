import { Router } from 'express';
import { login, refresh, logout, me } from '../../controllers/auth.controller.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { validate } from '../../middlewares/validate.js';
import { loginSchema } from '../../validators/auth.validator.js';
import { createRateLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many login attempts, please try again later',
});

router.post('/login', loginLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, me);

export default router;