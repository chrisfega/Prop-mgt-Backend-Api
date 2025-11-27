import express from 'express';
import * as leaseController from './leases.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(leaseController.getAllLeases)
  .post(restrictTo('ADMIN', 'STAFF'), leaseController.createLease);

router.route('/:id')
  .get(leaseController.getLeaseById);

router.post('/:id/terminate', restrictTo('ADMIN', 'STAFF'), leaseController.terminateLease);

export default router;
