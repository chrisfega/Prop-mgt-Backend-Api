"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaseService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
const client_1 = require("@prisma/client");
class LeaseService {
    async createLease(data) {
        // 1. Validate unit availability
        const unit = await prisma_1.default.unit.findUnique({ where: { id: data.unitId } });
        if (!unit)
            throw new AppError_1.AppError('Unit not found', 404);
        if (unit.status !== 'VACANT')
            throw new AppError_1.AppError('Unit is not vacant', 400);
        // 2. Create Lease
        const lease = await prisma_1.default.lease.create({
            data: {
                ...data,
                status: 'ACTIVE',
            },
        });
        // 3. Update Unit status and currentTenant
        await prisma_1.default.unit.update({
            where: { id: data.unitId },
            data: {
                status: 'OCCUPIED',
                // currentTenantId: data.tenantId // Removed column, now handled by Tenant side or virtual
            },
        });
        // 4. Update Tenant currentUnit
        await prisma_1.default.tenant.update({
            where: { id: data.tenantId },
            data: {
                currentUnitId: data.unitId,
                status: 'ACTIVE',
            },
        });
        // 5. Generate Rent Schedule (Invoices)
        await this.generateRentSchedule(lease);
        return lease;
    }
    async generateRentSchedule(lease) {
        const invoices = [];
        let currentDate = new Date(lease.startDate);
        const endDate = new Date(lease.endDate);
        while (currentDate < endDate) {
            invoices.push({
                leaseId: lease.id,
                tenantId: lease.tenantId,
                unitId: lease.unitId,
                dueDate: new Date(currentDate),
                amount: lease.rentAmount,
                type: client_1.InvoiceType.RENT,
                status: client_1.InvoiceStatus.PENDING,
            });
            // Increment date based on frequency
            if (lease.paymentFrequency === client_1.PaymentFrequency.MONTHLY) {
                currentDate.setMonth(currentDate.getMonth() + 1);
            }
            else if (lease.paymentFrequency === client_1.PaymentFrequency.QUARTERLY) {
                currentDate.setMonth(currentDate.getMonth() + 3);
            }
            else if (lease.paymentFrequency === client_1.PaymentFrequency.YEARLY) {
                currentDate.setFullYear(currentDate.getFullYear() + 1);
            }
        }
        if (invoices.length > 0) {
            await prisma_1.default.invoice.createMany({
                data: invoices,
            });
        }
    }
    async getAllLeases() {
        return prisma_1.default.lease.findMany({
            include: {
                tenant: true,
                unit: {
                    include: {
                        property: true
                    }
                },
            },
        });
    }
    async getLeaseById(id) {
        const lease = await prisma_1.default.lease.findUnique({
            where: { id },
            include: {
                tenant: true,
                unit: {
                    include: {
                        property: true
                    }
                },
                invoices: true,
            },
        });
        if (!lease) {
            throw new AppError_1.AppError('Lease not found', 404);
        }
        return lease;
    }
    async terminateLease(id) {
        const lease = await this.getLeaseById(id);
        // Update lease status
        await prisma_1.default.lease.update({
            where: { id },
            data: { status: 'TERMINATED', endDate: new Date() } // Set end date to now
        });
        // Update unit status
        await prisma_1.default.unit.update({
            where: { id: lease.unitId },
            data: { status: 'VACANT' }
        });
        // Update tenant status
        await prisma_1.default.tenant.update({
            where: { id: lease.tenantId },
            data: { currentUnitId: null, status: 'MOVED_OUT' }
        });
        // Cancel future pending invoices?
        // For MVP, leave them or mark as cancelled if we had that status.
    }
}
exports.LeaseService = LeaseService;
