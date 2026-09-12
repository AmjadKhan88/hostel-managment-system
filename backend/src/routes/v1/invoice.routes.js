import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createInvoiceSchema } from '../../validators/invoice.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as invoiceController from '../../controllers/invoice.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.PAYMENTS_CREATE),
  validate({ body: createInvoiceSchema }),
  invoiceController.createInvoice
);
router.get('/', authorize(PERMISSIONS.PAYMENTS_READ), invoiceController.listInvoices);
router.get(
  '/outstanding-balances',
  authorize(PERMISSIONS.PAYMENTS_READ),
  invoiceController.getOutstandingBalances
);
router.get('/:id', authorize(PERMISSIONS.PAYMENTS_READ), invoiceController.getInvoice);
router.post('/:id/void', authorize(PERMISSIONS.PAYMENTS_CREATE), invoiceController.voidInvoice);

export default router;