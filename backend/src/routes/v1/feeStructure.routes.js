import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createFeeStructureSchema, updateFeeStructureSchema } from '../../validators/feeStructure.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as feeStructureController from '../../controllers/feeStructure.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.PAYMENTS_CREATE),
  validate({ body: createFeeStructureSchema }),
  feeStructureController.createFeeStructure
);
router.get('/', authorize(PERMISSIONS.PAYMENTS_READ), feeStructureController.listFeeStructures);
router.get('/:id', authorize(PERMISSIONS.PAYMENTS_READ), feeStructureController.getFeeStructure);
router.patch(
  '/:id',
  authorize(PERMISSIONS.PAYMENTS_CREATE),
  validate({ body: updateFeeStructureSchema }),
  feeStructureController.updateFeeStructure
);

export default router;