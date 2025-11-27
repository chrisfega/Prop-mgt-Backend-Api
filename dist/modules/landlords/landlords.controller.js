"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLandlord = exports.updateLandlord = exports.getLandlordById = exports.getAllLandlords = exports.createLandlord = void 0;
const landlords_service_1 = require("./landlords.service");
const catchAsync_1 = require("../../utils/catchAsync");
const zod_1 = require("zod");
const landlordService = new landlords_service_1.LandlordService();
const createLandlordSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    email: zod_1.z.string().email(),
    phone: zod_1.z.string(),
    bankName: zod_1.z.string().optional(),
    bankAccountNumber: zod_1.z.string().optional(),
    bankAccountName: zod_1.z.string().optional(),
    notes: zod_1.z.string().optional(),
});
const updateLandlordSchema = createLandlordSchema.partial();
exports.createLandlord = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = createLandlordSchema.parse(req.body);
    const landlord = await landlordService.createLandlord(data);
    res.status(201).json({ status: 'success', data: { landlord } });
});
exports.getAllLandlords = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const landlords = await landlordService.getAllLandlords();
    res.status(200).json({ status: 'success', results: landlords.length, data: { landlords } });
});
exports.getLandlordById = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const landlord = await landlordService.getLandlordById(req.params.id);
    res.status(200).json({ status: 'success', data: { landlord } });
});
exports.updateLandlord = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const data = updateLandlordSchema.parse(req.body);
    const landlord = await landlordService.updateLandlord(req.params.id, data);
    res.status(200).json({ status: 'success', data: { landlord } });
});
exports.deleteLandlord = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    await landlordService.deleteLandlord(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});
