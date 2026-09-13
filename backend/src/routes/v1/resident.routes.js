import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { upload } from '../../middlewares/upload.js';
import { createResidentSchema, updateResidentSchema } from '../../validators/resident.validator.js';
import { uploadDocumentSchema } from '../../validators/document.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as residentController from '../../controllers/resident.controller.js';
import * as documentController from '../../controllers/document.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.STUDENT_CREATE),
  validate({ body: createResidentSchema }),
  residentController.createResident
);
router.get('/', authorize(PERMISSIONS.STUDENT_READ), residentController.listResidents);
router.get('/:id', authorize(PERMISSIONS.STUDENT_READ), residentController.getResident);
router.patch(
  '/:id',
  authorize(PERMISSIONS.STUDENT_UPDATE),
  validate({ body: updateResidentSchema }),
  residentController.updateResident
);

// Documents, nested under their resident.
router.post(
  '/:residentId/documents',
  authorize(PERMISSIONS.STUDENT_UPDATE),
  upload.single('file'),
  validate({ body: uploadDocumentSchema }),
  documentController.uploadDocument
);
router.get('/:residentId/documents', authorize(PERMISSIONS.STUDENT_READ), documentController.listDocuments);
router.delete(
  '/:residentId/documents/:id',
  authorize(PERMISSIONS.STUDENT_UPDATE),
  documentController.deleteDocument
);

export default router;