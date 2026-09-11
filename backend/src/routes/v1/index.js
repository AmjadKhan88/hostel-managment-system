import { Router } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../../utils/ApiResponse.js';
import authRoutes from './auth.routes.js';
import hostelRoutes from './hostel.routes.js';
import buildingRoutes from './building.routes.js';
import roomRoutes from './room.routes.js';
import residentRoutes from './resident.routes.js';
import allocationRoutes from './allocation.routes.js';
import roleRoutes from './role.routes.js';
import staffRoutes from './staff.routes.js';
import metaRoutes from './meta.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import complaintRoutes from './complaint.routes.js';

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
router.use('/hostels', hostelRoutes);
router.use('/buildings', buildingRoutes);
router.use('/rooms', roomRoutes);
router.use('/residents', residentRoutes);
router.use('/allocations', allocationRoutes);
router.use('/roles', roleRoutes);
router.use('/staff', staffRoutes);
router.use('/meta', metaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/complaints', complaintRoutes);

// Further module routers (admissions, payments, maintenance, ...) are
// mounted here as each is implemented on its own scoped day.

export default router;