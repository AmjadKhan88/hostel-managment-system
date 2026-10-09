import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { recordPaymentSchema, refundPaymentSchema } from '../../validators/payment.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as paymentController from '../../controllers/payment.controller.js';
import * as documentController from '../../controllers/document.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.PAYMENTS_CREATE),
  validate({ body: recordPaymentSchema }),
  paymentController.recordPayment
);
router.get('/', authorize(PERMISSIONS.PAYMENTS_READ), paymentController.listPayments);
router.get('/:id', authorize(PERMISSIONS.PAYMENTS_READ), paymentController.getPayment);
router.get(
  '/:id/receipt',
  authorize(PERMISSIONS.PAYMENTS_READ),
  documentController.staffReceiptPdf
);
router.post(
  '/:id/refund',
  authorize(PERMISSIONS.PAYMENTS_REFUND),
  validate({ body: refundPaymentSchema }),
  paymentController.refundPayment
);

export default router;
