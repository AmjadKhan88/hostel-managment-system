import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as financeController from '../../controllers/finance.controller.js';

const router = Router();

router.use(authenticate);
// Requires both — it's payments AND expenses data combined.
router.get(
  '/overview',
  authorize(PERMISSIONS.PAYMENTS_READ, PERMISSIONS.EXPENSES_READ),
  financeController.getFinancialOverview
);

export default router;
