import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { upload } from '../../middlewares/upload.js';
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

// Single-hostel settings routes use settings.manage rather than
// hostel.manage — a hostel-scoped Owner/Admin can edit their own hostel's
// settings without needing the ability to create or list every hostel.
router.get('/:id', authorize(PERMISSIONS.SETTINGS_MANAGE), hostelController.getHostel);
router.patch(
  '/:id',
  authorize(PERMISSIONS.SETTINGS_MANAGE),
  validate({ body: updateHostelSchema }),
  hostelController.updateHostel
);
router.post('/:id/logo', authorize(PERMISSIONS.SETTINGS_MANAGE), upload.single('file'), hostelController.uploadLogo);

export default router;