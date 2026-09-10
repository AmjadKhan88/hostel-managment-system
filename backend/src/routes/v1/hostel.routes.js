import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createHostelSchema, updateHostelSchema } from '../../validators/hostel.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as hostelController from '../../controllers/hostel.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.HOSTEL_MANAGE),
  validate({ body: createHostelSchema }),
  hostelController.createHostel
);
router.get('/', authorize(PERMISSIONS.HOSTEL_MANAGE), hostelController.listHostels);
router.get('/:id', authorize(PERMISSIONS.HOSTEL_MANAGE), hostelController.getHostel);
router.patch(
  '/:id',
  authorize(PERMISSIONS.HOSTEL_MANAGE),
  validate({ body: updateHostelSchema }),
  hostelController.updateHostel
);

export default router;