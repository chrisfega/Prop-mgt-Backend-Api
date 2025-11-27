"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceService = void 0;
const prisma_1 = __importDefault(require("../../database/prisma"));
class MaintenanceService {
    async createTicket(data) {
        return prisma_1.default.maintenanceTicket.create({
            data,
        });
    }
    async getAllTickets() {
        return prisma_1.default.maintenanceTicket.findMany({
            include: {
                property: true,
                unit: true,
                tenant: true,
            },
        });
    }
    async updateTicketStatus(id, status) {
        return prisma_1.default.maintenanceTicket.update({
            where: { id },
            data: { status },
        });
    }
}
exports.MaintenanceService = MaintenanceService;
