import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { checkInVisitorSchema } from '../../validators/visitor.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as visitorController from '../../controllers/visitor.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.VISITORS_MANAGE),
  validate({ body: checkInVisitorSchema }),
  visitorController.checkInVisitor
);
router.get('/', authorize(PERMISSIONS.VISITORS_MANAGE), visitorController.listVisitors);
router.post('/:id/checkout', authorize(PERMISSIONS.VISITORS_MANAGE), visitorController.checkOutVisitor);

export default router;