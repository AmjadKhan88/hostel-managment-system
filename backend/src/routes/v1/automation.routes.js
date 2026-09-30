import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import { monthlyInvoiceQueue, paymentReminderQueue } from '../../jobs/queues.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';
import * as automationController from '../../controllers/automation.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.SETTINGS_MANAGE));

router.get('/status', automationController.getStatus);
router.post('/jobs/:queue/:jobId/retry', automationController.retryJob);

router.post(
  '/trigger/monthly-invoices',
  asyncHandler(async (req, res) => {
    if (!req.body.hostelId) {
      throw ApiError.badRequest('hostelId is required');
    }
    const job = await monthlyInvoiceQueue.add('generate-monthly-invoices-manual', {
      hostelId: req.body.hostelId,
    });
    new ApiResponse(202, { jobId: job.id }, 'Monthly invoice generation job queued').send(res);
  })
);

router.post(
  '/trigger/payment-reminders',
  asyncHandler(async (req, res) => {
    const job = await paymentReminderQueue.add('send-payment-reminders-manual', {
      hostelId: req.body.hostelId,
    });
    new ApiResponse(202, { jobId: job.id }, 'Payment reminder job queued').send(res);
  })
);

export default router;
