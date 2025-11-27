"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendReminders = exports.getRemindersPreview = exports.getInvoiceById = exports.getAllInvoices = void 0;
const invoices_service_1 = require("./invoices.service");
const catchAsync_1 = require("../../utils/catchAsync");
const invoiceService = new invoices_service_1.InvoiceService();
exports.getAllInvoices = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const invoices = await invoiceService.getAllInvoices();
    res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
});
exports.getInvoiceById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const invoice = await invoiceService.getInvoiceById(req.params.id);
    res.status(200).json({ status: 'success', data: { invoice } });
});
exports.getRemindersPreview = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const upcoming = await invoiceService.getUpcomingInvoicesForReminder();
    const overdue = await invoiceService.getOverdueInvoicesForReminder();
    res.status(200).json({ status: 'success', data: { upcoming, overdue } });
});
exports.sendReminders = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    // Stub implementation
    console.log('Sending reminders...');
    res.status(200).json({ status: 'success', message: 'Reminders sent (simulated)' });
});
