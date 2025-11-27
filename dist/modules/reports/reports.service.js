"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
class ReportsService {
    async getDashboardSummary() {
        const totalProperties = await prisma_1.default.property.count();
        const totalUnits = await prisma_1.default.unit.count();
        const totalOccupiedUnits = await prisma_1.default.unit.count({ where: { status: 'OCCUPIED' } });
        const totalVacantUnits = await prisma_1.default.unit.count({ where: { status: 'VACANT' } });
        const totalTenants = await prisma_1.default.tenant.count();
        const totalLandlords = await prisma_1.default.landlord.count();
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        currentMonthStart.setHours(0, 0, 0, 0);
        const currentMonthEnd = new Date(currentMonthStart);
        currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);
        const rentDueThisMonth = await prisma_1.default.invoice.aggregate({
            where: {
                type: 'RENT',
                dueDate: {
                    gte: currentMonthStart,
                    lt: currentMonthEnd
                }
            },
            _sum: {
                amount: true
            }
        });
        const rentCollectedThisMonth = await prisma_1.default.payment.aggregate({
            where: {
                paymentDate: {
                    gte: currentMonthStart,
                    lt: currentMonthEnd
                },
                invoice: {
                    type: 'RENT'
                }
            },
            _sum: {
                amount: true
            }
        });
        const overdueInvoices = await prisma_1.default.invoice.aggregate({
            where: {
                status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
                dueDate: { lt: new Date() }
            },
            _sum: {
                amount: true
            }
        });
        return {
            totalProperties,
            totalUnits,
            totalOccupiedUnits,
            totalVacantUnits,
            totalTenants,
            totalLandlords,
            totalRentDueThisMonth: rentDueThisMonth._sum.amount || 0,
            totalRentCollectedThisMonth: rentCollectedThisMonth._sum.amount || 0,
            totalOverdueAmount: overdueInvoices._sum.amount || 0
        };
    }
    async getLeasesExpiringSoon(days = 30) {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + days);
        return prisma_1.default.lease.findMany({
            where: {
                endDate: {
                    gte: today,
                    lte: futureDate
                },
                status: 'ACTIVE'
            },
            include: {
                tenant: true,
                unit: true
            }
        });
    }
    async getOutstandingPayments() {
        return prisma_1.default.invoice.findMany({
            where: {
                status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
                dueDate: { lt: new Date() }
            },
            include: {
                tenant: true
            }
        });
    }
}
exports.ReportsService = ReportsService;
