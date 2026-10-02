import { Router } from 'express';
import authRoutes from './auth.routes.js';
import dataRoutes from './data.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', dataRoutes);

export default router;
