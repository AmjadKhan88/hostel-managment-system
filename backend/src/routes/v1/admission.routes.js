import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createAdmissionSchema, decisionSchema, checkInSchema } from '../../validators/admission.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as admissionController from '../../controllers/admission.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.STUDENT_CREATE),
  validate({ body: createAdmissionSchema }),
  admissionController.createAdmission
);
router.get('/', authorize(PERMISSIONS.STUDENT_READ), admissionController.listAdmissions);
router.get('/:id', authorize(PERMISSIONS.STUDENT_READ), admissionController.getAdmission);

router.post(
  '/:id/approve',
  authorize(PERMISSIONS.STUDENT_UPDATE),
  validate({ body: decisionSchema }),
  admissionController.approveAdmission
);
router.post(
  '/:id/reject',
  authorize(PERMISSIONS.STUDENT_UPDATE),
  validate({ body: decisionSchema }),
  admissionController.rejectAdmission
);
router.post(
  '/:id/waitlist',
  authorize(PERMISSIONS.STUDENT_UPDATE),
  validate({ body: decisionSchema }),
  admissionController.waitlistAdmission
);
router.post('/:id/verify-documents', authorize(PERMISSIONS.STUDENT_UPDATE), admissionController.verifyDocuments);
router.post(
  '/:id/check-in',
  // Check-in performs a real bed allocation, so it requires both
  // resident-update AND allocation permission — least privilege, not just
  // "can edit resident records."
  authorize(PERMISSIONS.STUDENT_UPDATE, PERMISSIONS.ROOM_ALLOCATE),
  validate({ body: checkInSchema }),
  admissionController.checkInAdmission
);
router.post('/:id/cancel', authorize(PERMISSIONS.STUDENT_UPDATE), admissionController.cancelAdmission);

export default router;