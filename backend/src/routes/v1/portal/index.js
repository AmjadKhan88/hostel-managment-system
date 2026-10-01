import { Router } from 'express';
import authRoutes from './auth.routes.js';

const router = Router();

router.use('/auth', authRoutes);

// Phase 2 mounts resident-facing data routes here: invoices, payments,
// complaints, notices — each scoped to req.resident.id only.

export default router;
