import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import { monthlyInvoiceQueue, paymentReminderQueue } from '../../jobs/queues.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.SETTINGS_MANAGE));

router.post(
  '/trigger/monthly-invoices',
  asyncHandler(async (req, res) => {
    const job = await monthlyInvoiceQueue.add('generate-monthly-invoices-manual', {});
    new ApiResponse(202, { jobId: job.id }, 'Monthly invoice generation job queued').send(res);
  })
);

router.post(
  '/trigger/payment-reminders',
  asyncHandler(async (req, res) => {
    const job = await paymentReminderQueue.add('send-payment-reminders-manual', {});
    new ApiResponse(202, { jobId: job.id }, 'Payment reminder job queued').send(res);
  })
);

export default router;