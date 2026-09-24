import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createRateLimiter } from '../../middlewares/rateLimiter.js';
import { askAssistantSchema } from '../../validators/aiAssistant.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as aiAssistantController from '../../controllers/aiAssistant.controller.js';

const router = Router();

router.use(authenticate);

// AI calls cost real money per request — rate limit tighter than ordinary CRUD.
const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 15,
  message: 'Too many assistant requests, please slow down',
});

router.post(
  '/ask',
  aiLimiter,
  authorize(PERMISSIONS.REPORTS_READ),
  validate({ body: askAssistantSchema }),
  aiAssistantController.ask
);
router.get('/history', authorize(PERMISSIONS.REPORTS_READ), aiAssistantController.getHistory);

export default router;
