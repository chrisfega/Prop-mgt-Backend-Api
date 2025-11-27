"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
class PaymentService {
    async recordPayment(data) {
        // 1. Get invoice
        const invoice = await prisma_1.default.invoice.findUnique({ where: { id: data.invoiceId } });
        if (!invoice)
            throw new AppError_1.AppError('Invoice not found', 404);
        // 2. Create Payment
        const payment = await prisma_1.default.payment.create({
            data,
        });
        // 3. Update Invoice Status
        // Calculate total paid
        const allPayments = await prisma_1.default.payment.findMany({ where: { invoiceId: data.invoiceId } });
        const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
        let newStatus = invoice.status;
        if (totalPaid >= Number(invoice.amount)) {
            newStatus = 'PAID';
        }
        else if (totalPaid > 0) {
            newStatus = 'PARTIALLY_PAID';
        }
        await prisma_1.default.invoice.update({
            where: { id: data.invoiceId },
            data: { status: newStatus }
        });
        return payment;
    }
    async getAllPayments() {
        return prisma_1.default.payment.findMany({
            include: {
                invoice: {
                    include: {
                        tenant: true
                    }
                }
            },
        });
    }
}
exports.PaymentService = PaymentService;
