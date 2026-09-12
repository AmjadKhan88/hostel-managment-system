import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createMaintenanceSchema, updateMaintenanceSchema } from '../../validators/maintenance.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as maintenanceController from '../../controllers/maintenance.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.MAINTENANCE_MANAGE),
  validate({ body: createMaintenanceSchema }),
  maintenanceController.createTicket
);
router.get('/', authorize(PERMISSIONS.MAINTENANCE_READ), maintenanceController.listTickets);
router.get('/:id', authorize(PERMISSIONS.MAINTENANCE_READ), maintenanceController.getTicket);
router.patch(
  '/:id',
  authorize(PERMISSIONS.MAINTENANCE_MANAGE),
  validate({ body: updateMaintenanceSchema }),
  maintenanceController.updateTicket
);

export default router;