import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as auditController from '../../controllers/audit.controller.js';

const router = Router();

router.use(authenticate);
// Reuses settings.manage — audit log access is an admin/compliance
// concern, matching how Settings itself is gated.
router.get('/', authorize(PERMISSIONS.SETTINGS_MANAGE), auditController.listAuditLogs);

export default router;