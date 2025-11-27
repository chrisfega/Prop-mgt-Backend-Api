import express from 'express';
import * as reportsController from './reports.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/dashboard/summary', reportsController.getDashboardSummary);
router.get('/lease-expiring-soon', reportsController.getLeasesExpiringSoon);
router.get('/outstanding-payments', reportsController.getOutstandingPayments);

export default router;
