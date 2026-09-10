import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { allocateBedSchema, transferResidentSchema } from '../../validators/allocation.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as allocationController from '../../controllers/allocation.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.ROOM_ALLOCATE),
  validate({ body: allocateBedSchema }),
  allocationController.allocateBed
);
router.post(
  '/:residentId/transfer',
  authorize(PERMISSIONS.ROOM_ALLOCATE),
  validate({ body: transferResidentSchema }),
  allocationController.transferResident
);
router.post(
  '/:residentId/checkout',
  authorize(PERMISSIONS.ROOM_ALLOCATE),
  allocationController.checkoutResident
);
router.get(
  '/:residentId/history',
  authorize(PERMISSIONS.STUDENT_READ),
  allocationController.listAllocationHistory
);

export default router;