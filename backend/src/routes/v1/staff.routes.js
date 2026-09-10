import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createStaffSchema, updateStaffSchema } from '../../validators/staff.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as staffController from '../../controllers/staff.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.STAFF_MANAGE),
  validate({ body: createStaffSchema }),
  staffController.createStaff
);
router.get('/', authorize(PERMISSIONS.STAFF_MANAGE), staffController.listStaff);
router.get('/:id', authorize(PERMISSIONS.STAFF_MANAGE), staffController.getStaff);
router.patch(
  '/:id',
  authorize(PERMISSIONS.STAFF_MANAGE),
  validate({ body: updateStaffSchema }),
  staffController.updateStaff
);

export default router;