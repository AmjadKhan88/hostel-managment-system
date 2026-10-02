import { Router } from 'express';
import { authenticateResident } from '../../../middlewares/authenticateResident.js';
import { validate } from '../../../middlewares/validate.js';
import { submitComplaintSchema } from '../../../validators/portal.validator.js';
import * as portalController from '../../../controllers/portal.controller.js';

const router = Router();

// Every route below requires a resident session. There are no permission
// checks beyond that — a resident's only "permission" is access to their
// own data, which portal.service.js enforces via the query filters
// themselves, not a role/permission system like staff has.
router.use(authenticateResident);

router.get('/invoices', portalController.listMyInvoices);
router.get('/invoices/:id', portalController.getMyInvoice);

router.get('/payments', portalController.listMyPayments);

router.get('/complaints', portalController.listMyComplaints);
router.get('/complaints/:id', portalController.getMyComplaint);
router.post(
  '/complaints',
  validate({ body: submitComplaintSchema }),
  portalController.submitComplaint
);

router.get('/notices', portalController.listMyNotices);

export default router;
