import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as metaController from '../../controllers/meta.controller.js';

const router = Router();

router.use(authenticate);

router.get('/permissions', authorize(PERMISSIONS.ROLES_MANAGE), metaController.listPermissions);

export default router;