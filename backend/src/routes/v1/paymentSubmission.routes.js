import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { rejectSubmissionSchema } from '../../validators/paymentSubmission.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as paymentSubmissionController from '../../controllers/paymentSubmission.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', authorize(PERMISSIONS.PAYMENTS_READ), paymentSubmissionController.listSubmissions);
router.get('/:id', authorize(PERMISSIONS.PAYMENTS_READ), paymentSubmissionController.getSubmission);
router.post(
  '/:id/approve',
  authorize(PERMISSIONS.PAYMENTS_MANAGE),
  paymentSubmissionController.approveSubmission
);
router.post(
  '/:id/reject',
  authorize(PERMISSIONS.PAYMENTS_MANAGE),
  validate({ body: rejectSubmissionSchema }),
  paymentSubmissionController.rejectSubmission
);

export default router;
