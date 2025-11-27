"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTenant = exports.updateTenant = exports.getTenantById = exports.getAllTenants = exports.createTenant = void 0;
const tenants_service_1 = require("./tenants.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const tenantService = new tenants_service_1.TenantService();
const createTenantSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    emergencyContactName: zod_1.z.string().optional(),
    emergencyContactPhone: zod_1.z.string().optional(),
    status: zod_1.z.enum(['ACTIVE', 'MOVED_OUT', 'EVICTED', 'PENDING']).optional(),
});
const updateTenantSchema = createTenantSchema.partial();
exports.createTenant = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createTenantSchema.parse(req.body);
    const tenant = await tenantService.createTenant(data);
    res.status(201).json({ status: 'success', data: { tenant } });
});
exports.getAllTenants = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tenants = await tenantService.getAllTenants();
    res.status(200).json({ status: 'success', results: tenants.length, data: { tenants } });
});
exports.getTenantById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const tenant = await tenantService.getTenantById(req.params.id);
    res.status(200).json({ status: 'success', data: { tenant } });
});
exports.updateTenant = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = updateTenantSchema.parse(req.body);
    const tenant = await tenantService.updateTenant(req.params.id, data);
    res.status(200).json({ status: 'success', data: { tenant } });
});
exports.deleteTenant = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    await tenantService.deleteTenant(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
