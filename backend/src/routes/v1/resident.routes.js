import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createResidentSchema, updateResidentSchema } from '../../validators/resident.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as residentController from '../../controllers/resident.controller.js';

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

export default router;