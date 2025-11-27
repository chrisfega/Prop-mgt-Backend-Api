import express from 'express';
import * as invoiceController from './invoices.controller';
import { protect, restrictTo } from '../../middleware/auth.middleware';

const router = express.Router();

router.use(protect);

router.get('/', invoiceController.getAllInvoices);
router.post('/', invoiceController.createInvoice);
router.get('/reminders/preview', restrictTo('ADMIN'), invoiceController.getRemindersPreview);
router.post('/reminders/send', restrictTo('ADMIN'), invoiceController.sendReminders);
router.get('/:id', invoiceController.getInvoiceById);
router.patch('/:id', invoiceController.updateInvoice);

export default router;
