import { Router } from 'express';
import { authenticateResident } from '../../../middlewares/authenticateResident.js';
import { validate } from '../../../middlewares/validate.js';
import { upload } from '../../../middlewares/upload.js';
import {
  submitComplaintSchema,
  updateMyProfileSchema,
  uploadMyDocumentSchema,
  submitMaintenanceRequestSchema,
  preRegisterVisitorSchema,
} from '../../../validators/portal.validator.js';
import { createPaymentSubmissionSchema } from '../../../validators/paymentSubmission.validator.js';
import * as portalController from '../../../controllers/portal.controller.js';

const router = Router();

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

router.get('/maintenance', portalController.listMyMaintenanceTickets);
router.get('/maintenance/:id', portalController.getMyMaintenanceTicket);
router.post(
  '/maintenance',
  validate({ body: submitMaintenanceRequestSchema }),
  portalController.submitMaintenanceRequest
);

router.get('/profile', portalController.getMyProfile);
router.patch(
  '/profile',
  validate({ body: updateMyProfileSchema }),
  portalController.updateMyProfile
);

router.get('/documents', portalController.listMyDocuments);
router.post(
  '/documents',
  upload.single('file'),
  validate({ body: uploadMyDocumentSchema }),
  portalController.uploadMyDocument
);
router.delete('/documents/:id', portalController.deleteMyDocument);

router.get('/visitors', portalController.listMyVisitors);
router.post(
  '/visitors',
  validate({ body: preRegisterVisitorSchema }),
  portalController.preRegisterVisitor
);
router.post('/visitors/:id/cancel', portalController.cancelVisitor);

router.get('/payment-methods', portalController.getMyPaymentMethods);

router.get('/payment-submissions', portalController.listMyPaymentSubmissions);
router.post(
  '/payment-submissions',
  upload.single('screenshot'),
  validate({ body: createPaymentSubmissionSchema }),
  portalController.submitPaymentProof
);

export default router;
