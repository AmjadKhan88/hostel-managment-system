import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  createComplaintSchema,
  updateComplaintSchema,
  addCommentSchema,
} from '../../validators/complaint.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as complaintController from '../../controllers/complaint.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.COMPLAINTS_MANAGE),
  validate({ body: createComplaintSchema }),
  complaintController.createComplaint
);
router.get('/', authorize(PERMISSIONS.COMPLAINTS_READ), complaintController.listComplaints);
router.get('/:id', authorize(PERMISSIONS.COMPLAINTS_READ), complaintController.getComplaint);
router.patch(
  '/:id',
  authorize(PERMISSIONS.COMPLAINTS_MANAGE),
  validate({ body: updateComplaintSchema }),
  complaintController.updateComplaint
);
router.post(
  '/:id/comments',
  authorize(PERMISSIONS.COMPLAINTS_MANAGE),
  validate({ body: addCommentSchema }),
  complaintController.addComment
);

export default router;