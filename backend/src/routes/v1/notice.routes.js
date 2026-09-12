import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createNoticeSchema, updateNoticeSchema } from '../../validators/notice.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as noticeController from '../../controllers/notice.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.NOTICES_MANAGE),
  validate({ body: createNoticeSchema }),
  noticeController.createNotice
);
router.get('/', authorize(PERMISSIONS.NOTICES_MANAGE), noticeController.listNotices);
router.get('/:id', authorize(PERMISSIONS.NOTICES_MANAGE), noticeController.getNotice);
router.patch(
  '/:id',
  authorize(PERMISSIONS.NOTICES_MANAGE),
  validate({ body: updateNoticeSchema }),
  noticeController.updateNotice
);
router.delete('/:id', authorize(PERMISSIONS.NOTICES_MANAGE), noticeController.deleteNotice);

export default router;