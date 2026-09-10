import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import {
  createBuildingSchema,
  updateBuildingSchema,
  addFloorSchema,
} from '../../validators/building.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as buildingController from '../../controllers/building.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.BUILDING_MANAGE),
  validate({ body: createBuildingSchema }),
  buildingController.createBuilding
);
router.get('/', authorize(PERMISSIONS.ROOM_READ), buildingController.listBuildings);
router.get('/:id', authorize(PERMISSIONS.ROOM_READ), buildingController.getBuilding);
router.patch(
  '/:id',
  authorize(PERMISSIONS.BUILDING_MANAGE),
  validate({ body: updateBuildingSchema }),
  buildingController.updateBuilding
);
router.post(
  '/:id/floors',
  authorize(PERMISSIONS.BUILDING_MANAGE),
  validate({ body: addFloorSchema }),
  buildingController.addFloor
);

export default router;