"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
const AppError_1 = require("../../utils/AppError");
class PropertyService {
    async createProperty(data) {
        return prisma_1.default.property.create({
            data,
        });
    }
    async getAllProperties() {
        return prisma_1.default.property.findMany({
            include: {
                units: true,
                landlord: true,
            },
        });
    }
    async getPropertyById(id) {
        const property = await prisma_1.default.property.findUnique({
            where: { id },
            include: {
                units: {
                    include: {
                        currentTenant: true
                    }
                },
                landlord: true,
                tickets: true,
            },
        });
        if (!property) {
            throw new AppError_1.AppError('Property not found', 404);
        }
        return property;
    }
    async updateProperty(id, data) {
        const property = await prisma_1.default.property.update({
            where: { id },
            data,
        });
        return property;
    }
    async deleteProperty(id) {
        await prisma_1.default.property.delete({
            where: { id },
        });
    }
    // Unit methods
    async createUnit(propertyId, data) {
        return prisma_1.default.unit.create({
            data: {
                ...data,
                propertyId,
            },
        });
    }
    async updateUnit(id, data) {
        return prisma_1.default.unit.update({
            where: { id },
            data
        });
    }
    async deleteUnit(id) {
        return prisma_1.default.unit.delete({
            where: { id }
        });
    }
    async getVacantUnits() {
        return prisma_1.default.unit.findMany({
            where: {
                status: 'VACANT'
            },
            include: {
                property: true
            }
        });
    }
}
exports.PropertyService = PropertyService;
