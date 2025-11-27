import express from 'express';
import * as landlordsController from './landlords.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', landlordsController.getAllLandlords);
router.post('/', landlordsController.createLandlord);
router.get('/:id', landlordsController.getLandlord);
router.patch('/:id', landlordsController.updateLandlord);

export default router;
