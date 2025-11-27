"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.terminateLease = exports.getLeaseById = exports.getAllLeases = exports.createLease = void 0;
const leases_service_1 = require("./leases.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const leaseService = new leases_service_1.LeaseService();
const createLeaseSchema = zod_1.z.object({
    tenantId: zod_1.z.string(),
    unitId: zod_1.z.string(),
    startDate: zod_1.z.string().transform((str) => new Date(str)),
    endDate: zod_1.z.string().transform((str) => new Date(str)),
    rentAmount: zod_1.z.number(),
    paymentFrequency: zod_1.z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
    securityDepositAmount: zod_1.z.number().optional(),
});
exports.createLease = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createLeaseSchema.parse(req.body);
    const lease = await leaseService.createLease(data);
    res.status(201).json({ status: 'success', data: { lease } });
});
exports.getAllLeases = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const leases = await leaseService.getAllLeases();
    res.status(200).json({ status: 'success', results: leases.length, data: { leases } });
});
exports.getLeaseById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const lease = await leaseService.getLeaseById(req.params.id);
    res.status(200).json({ status: 'success', data: { lease } });
});
exports.terminateLease = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    await leaseService.terminateLease(req.params.id);
    res.status(200).json({ status: 'success', message: 'Lease terminated successfully' });
});
