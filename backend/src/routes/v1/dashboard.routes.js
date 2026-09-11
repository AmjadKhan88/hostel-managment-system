import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import * as dashboardController from '../../controllers/dashboard.controller.js';

const router = Router();

router.use(authenticate);

// No specific permission required beyond authentication — every staff
// role should be able to see their own hostel's dashboard, matching the
// sidebar's Dashboard item (the only nav entry with no `permission` set).
router.get('/summary', dashboardController.getSummary);

export default router;