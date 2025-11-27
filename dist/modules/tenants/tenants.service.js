"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
class TenantService {
    async createTenant(data) {
        return prisma_1.default.tenant.create({
            data,
        });
    }
    async getAllTenants() {
        return prisma_1.default.tenant.findMany({
            include: {
                currentUnit: {
                    include: {
                        property: true,
                    },
                },
            },
        });
    }
    async getTenantById(id) {
        const tenant = await prisma_1.default.tenant.findUnique({
            where: { id },
            include: {
                currentUnit: {
                    include: {
                        property: true,
                    },
                },
                leases: true,
                invoices: true,
                documents: true,
            },
        });
        if (!tenant) {
            throw new AppError_1.AppError('Tenant not found', 404);
        }
        return tenant;
    }
    async updateTenant(id, data) {
        const tenant = await prisma_1.default.tenant.update({
            where: { id },
            data,
        });
        return tenant;
    }
    async deleteTenant(id) {
        await prisma_1.default.tenant.delete({
            where: { id },
        });
    }
}
exports.TenantService = TenantService;
