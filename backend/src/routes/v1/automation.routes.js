import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import { monthlyInvoiceQueue, paymentReminderQueue } from '../../jobs/queues.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiResponse } from '../../utils/ApiResponse.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.SETTINGS_MANAGE));

router.post(
  '/trigger/monthly-invoices',
  asyncHandler(async (req, res) => {
    // hostelId is required now — the processor generates invoices for one
    // hostel, using that hostel's own timezone to decide "this month."
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
    // hostelId is optional — omit it to run reminders for every active
    // hostel (mainly useful for testing).
    const job = await paymentReminderQueue.add('send-payment-reminders-manual', {
      hostelId: req.body.hostelId,
    });
    new ApiResponse(202, { jobId: job.id }, 'Payment reminder job queued').send(res);
  })
);

export default router;
