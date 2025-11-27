import express from 'express';
import * as maintenanceController from './maintenance.controller';
import { protect } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', maintenanceController.getAllTickets);
router.post('/', maintenanceController.createTicket);
router.patch('/:id', maintenanceController.updateTicketStatus);

export default router;
