"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPayments = exports.recordPayment = void 0;
const payments_service_1 = require("./payments.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const paymentService = new payments_service_1.PaymentService();
const createPaymentSchema = zod_1.z.object({
    invoiceId: zod_1.z.string(),
    amount: zod_1.z.number(),
    method: zod_1.z.enum(['BANK_TRANSFER', 'CASH', 'CARD', 'OTHER']),
    reference: zod_1.z.string().optional(),
});
exports.recordPayment = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createPaymentSchema.parse(req.body);
    const payment = await paymentService.recordPayment(data);
    res.status(201).json({ status: 'success', data: { payment } });
});
exports.getAllPayments = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const payments = await paymentService.getAllPayments();
    res.status(200).json({ status: 'success', results: payments.length, data: { payments } });
});
