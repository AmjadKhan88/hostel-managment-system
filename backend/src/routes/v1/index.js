import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../utils/ApiResponse.js';

const router = Router();

/**
 * Module routers are mounted here as each day's scope is implemented, e.g.:
 *   router.use('/auth', authRoutes);
 *   router.use('/residents', residentRoutes);
 *   router.use('/rooms', roomRoutes);
 * Day 1 only wires up infrastructure, so only /health exists so far.
 */

router.get('/health', (req, res) => {
  const dbStates = ['disconnected', 'connected', 'connecting', 'disconnecting'];

  new ApiResponse(200, {
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    database: dbStates[mongoose.connection.readyState] ?? 'unknown',
    timestamp: new Date().toISOString(),
  }, 'Service is healthy').send(res);
});

export default router;
