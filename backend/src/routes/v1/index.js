import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../utils/ApiResponse.js';
import authRoutes from './auth.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  new ApiResponse(200, {
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStates[mongoose.connection.readyState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  }, 'Service is healthy').send(res);
});

router.use('/auth', authRoutes);

// Further module routers (residents, rooms, payments, ...) are mounted here
// as each is implemented on its own scoped day.

export default router;