import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { authorize } from '../../middlewares/authorize.js';
import { validate } from '../../middlewares/validate.js';
import { createRoomSchema, updateRoomSchema } from '../../validators/room.validator.js';
import { createBedSchema, updateBedStatusSchema } from '../../validators/bed.validator.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import * as roomController from '../../controllers/room.controller.js';
import * as bedController from '../../controllers/bed.controller.js';

const router = Router();

router.use(authenticate);

router.post(
  '/',
  authorize(PERMISSIONS.ROOM_CREATE),
  validate({ body: createRoomSchema }),
  roomController.createRoom
);
router.get('/', authorize(PERMISSIONS.ROOM_READ), roomController.listRooms);
router.get('/:id', authorize(PERMISSIONS.ROOM_READ), roomController.getRoom);
router.patch(
  '/:id',
  authorize(PERMISSIONS.ROOM_UPDATE),
  validate({ body: updateRoomSchema }),
  roomController.updateRoom
);

// Beds nested under their room.
router.post(
  '/:roomId/beds',
  authorize(PERMISSIONS.ROOM_UPDATE),
  validate({ body: createBedSchema }),
  bedController.createBed
);
router.get('/:roomId/beds', authorize(PERMISSIONS.ROOM_READ), bedController.listBeds);
router.patch(
  '/:roomId/beds/:bedId/status',
  authorize(PERMISSIONS.ROOM_UPDATE),
  validate({ body: updateBedStatusSchema }),
  bedController.updateBedStatus
);

export default router;