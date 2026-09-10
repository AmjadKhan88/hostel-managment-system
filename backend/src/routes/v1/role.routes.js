import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createRoleSchema, updateRoleSchema } from '../../validators/role.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as roleController from '../../controllers/role.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.ROLES_MANAGE),
  validate({ body: createRoleSchema }),
  roleController.createRole
);
router.get('/', authorize(PERMISSIONS.ROLES_MANAGE), roleController.listRoles);
router.get('/:id', authorize(PERMISSIONS.ROLES_MANAGE), roleController.getRole);
router.patch(
  '/:id',
  authorize(PERMISSIONS.ROLES_MANAGE),
  validate({ body: updateRoleSchema }),
  roleController.updateRole
);

export default router;