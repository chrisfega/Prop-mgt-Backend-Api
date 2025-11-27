import express from 'express';
import * as tenantController from './tenants.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // Protect all routes

router.route('/')
  .get(tenantController.getAllTenants)
  .post(restrictTo('ADMIN', 'STAFF'), tenantController.createTenant);

router.route('/:id')
  .get(tenantController.getTenantById)
  .patch(restrictTo('ADMIN', 'STAFF'), tenantController.updateTenant)
  .delete(restrictTo('ADMIN'), tenantController.deleteTenant);

export default router;
