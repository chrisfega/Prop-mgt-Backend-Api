"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.getAllTickets = exports.createTicket = void 0;
const maintenance_service_1 = require("./maintenance.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const maintenanceService = new maintenance_service_1.MaintenanceService();
const createTicketSchema = zod_1.z.object({
    propertyId: zod_1.z.string(),
    unitId: zod_1.z.string().optional(),
    tenantId: zod_1.z.string().optional(),
    title: zod_1.z.string(),
    description: zod_1.z.string(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    reportedBy: zod_1.z.enum(['TENANT', 'STAFF']),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
});
exports.createTicket = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createTicketSchema.parse(req.body);
    const ticket = await maintenanceService.createTicket(data);
    res.status(201).json({ status: 'success', data: { ticket } });
});
exports.getAllTickets = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tickets = await maintenanceService.getAllTickets();
    res.status(200).json({ status: 'success', results: tickets.length, data: { tickets } });
});
exports.updateTicketStatus = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const { status } = updateStatusSchema.parse(req.body);
    const ticket = await maintenanceService.updateTicketStatus(req.params.id, status);
    res.status(200).json({ status: 'success', data: { ticket } });
});
