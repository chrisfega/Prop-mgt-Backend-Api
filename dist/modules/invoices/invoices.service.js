"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvoiceService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
class InvoiceService {
    async getAllInvoices() {
        return prisma_1.default.invoice.findMany({
            include: {
                tenant: true,
                unit: true,
                payments: true,
            },
        });
    }
    async getInvoiceById(id) {
        const invoice = await prisma_1.default.invoice.findUnique({
            where: { id },
            include: {
                tenant: true,
                unit: true,
                payments: true,
            },
        });
        if (!invoice) {
            throw new AppError_1.AppError('Invoice not found', 404);
        }
        return invoice;
    }
    async getUpcomingInvoicesForReminder() {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        return prisma_1.default.invoice.findMany({
            where: {
                dueDate: {
                    gte: today,
                    lte: nextWeek
                },
                status: 'PENDING'
            },
            include: {
                tenant: true
            }
        });
    }
    async getOverdueInvoicesForReminder() {
        const today = new Date();
        return prisma_1.default.invoice.findMany({
            where: {
                dueDate: {
                    lt: today
                },
                status: {
                    in: ['PENDING', 'PARTIALLY_PAID']
                }
            },
            include: {
                tenant: true
            }
        });
    }
}
exports.InvoiceService = InvoiceService;
