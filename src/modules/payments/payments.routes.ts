import express from 'express';
import * as paymentController from './payments.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.recordPayment);

export default router;
