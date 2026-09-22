import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import * as searchController from '../../controllers/search.controller.js';

const router = Router();

router.use(authenticate);
// No single blanket permission here — each category in the service
// self-filters by the requesting user's actual permissions.
router.get('/', searchController.search);

export default router;