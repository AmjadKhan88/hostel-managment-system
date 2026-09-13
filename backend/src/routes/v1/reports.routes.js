import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as reportsController from '../../controllers/reports.controller.js';

const router = Router();

router.use(authenticate);
router.use(authorize(PERMISSIONS.REPORTS_READ));

router.get('/occupancy', reportsController.getOccupancyReport);
router.get('/fee-collection', reportsController.getFeeCollectionReport);
router.get('/outstanding-dues', reportsController.getOutstandingDuesReport);
router.get('/admissions', reportsController.getAdmissionsReport);
router.get('/complaints', reportsController.getComplaintsReport);
router.get('/maintenance', reportsController.getMaintenanceReport);
router.get('/visitors', reportsController.getVisitorsReport);

export default router;