import express from 'express';
import * as propertyController from './properties.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';
import { upload } from '../../middleware/upload.middleware';

const router = express.Router();

router.use(protect);

router.get('/vacant-units', propertyController.getVacantUnits);

router.route('/')
  .get(propertyController.getAllProperties)
  .post(
    restrictTo('ADMIN', 'STAFF'), 
    upload.single('image'),
    propertyController.createProperty
  );

router.route('/:id')
  .get(propertyController.getPropertyById)
  .patch(
    restrictTo('ADMIN', 'STAFF'), 
    upload.single('image'),
    propertyController.updateProperty
  )
  .delete(restrictTo('ADMIN'), propertyController.deleteProperty);

router.post('/:propertyId/units', restrictTo('ADMIN', 'STAFF'), propertyController.createUnit);

export default router;
