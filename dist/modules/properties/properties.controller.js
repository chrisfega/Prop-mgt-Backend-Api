"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVacantUnits = exports.createUnit = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getAllProperties = exports.createProperty = void 0;
const properties_service_1 = require("./properties.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const propertyService = new properties_service_1.PropertyService();
const createPropertySchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    addressLine1: zod_1.z.string(),
    addressLine2: zod_1.z.string().optional(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    country: zod_1.z.string(),
    description: zod_1.z.string().optional(),
    type: zod_1.z.enum(['APARTMENT', 'DUPLEX', 'OFFICE', 'SHOP', 'SHORT_LET', 'OTHER']),
    landlordId: zod_1.z.string(),
});
const createUnitSchema = zod_1.z.object({
    name: zod_1.z.string(),
    monthlyRentAmount: zod_1.z.number(),
    status: zod_1.z.enum(['VACANT', 'OCCUPIED', 'RESERVED', 'UNDER_MAINTENANCE']).optional()
});
exports.createProperty = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createPropertySchema.parse(req.body);
    const property = await propertyService.createProperty(data);
    res.status(201).json({ status: 'success', data: { property } });
});
exports.getAllProperties = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const properties = await propertyService.getAllProperties();
    res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
});
exports.getPropertyById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const property = await propertyService.getPropertyById(req.params.id);
    res.status(200).json({ status: 'success', data: { property } });
});
exports.updateProperty = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const property = await propertyService.updateProperty(req.params.id, req.body);
    res.status(200).json({ status: 'success', data: { property } });
});
exports.deleteProperty = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    await propertyService.deleteProperty(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
exports.createUnit = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createUnitSchema.parse(req.body);
    const unit = await propertyService.createUnit(req.params.propertyId, data);
    res.status(201).json({ status: 'success', data: { unit } });
});
exports.getVacantUnits = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const units = await propertyService.getVacantUnits();
    res.status(200).json({ status: 'success', results: units.length, data: { units } });
});
