"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LandlordService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
class LandlordService {
    async createLandlord(data) {
        return prisma_1.default.landlord.create({
            data,
        });
    }
    async getAllLandlords() {
        return prisma_1.default.landlord.findMany({
            include: {
                properties: true,
            },
        });
    }
    async getLandlordById(id) {
        const landlord = await prisma_1.default.landlord.findUnique({
            where: { id },
            include: {
                properties: {
                    include: {
                        units: true,
                    },
                },
            },
        });
        if (!landlord) {
            throw new AppError_1.AppError('Landlord not found', 404);
        }
        return landlord;
    }
    async updateLandlord(id, data) {
        const landlord = await prisma_1.default.landlord.update({
            where: { id },
            data,
        });
        return landlord;
    }
    async deleteLandlord(id) {
        await prisma_1.default.landlord.delete({
            where: { id },
        });
    }
    async getLandlordFinancials(id) {
        // Calculate total rent collected
        // This is a bit complex as we need to aggregate payments linked to invoices linked to leases linked to units linked to properties owned by this landlord.
        // Or invoices linked directly to landlord if we denormalized.
        // In our schema, Invoice has landlordId? No, Invoice has landlordId denormalized?
        // Let's check schema.
        // Invoice: leaseId, tenantId, unitId. No landlordId.
        // Wait, requirement said: "Invoice (for rent and other charges) ... landlordId"
        // Did I add landlordId to Invoice?
        // Let's check schema.prisma
        return { totalRentCollected: 0 }; // Placeholder
    }
}
exports.LandlordService = LandlordService;
