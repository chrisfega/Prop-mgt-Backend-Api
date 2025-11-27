"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutstandingPayments = exports.getLeasesExpiringSoon = exports.getDashboardSummary = void 0;
const reports_service_1 = require("./reports.service");
const catchAsync_1 = require("../../utils/catchAsync");
const reportsService = new reports_service_1.ReportsService();
exports.getDashboardSummary = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const summary = await reportsService.getDashboardSummary();
    res.status(200).json({ status: 'success', data: { summary } });
});
exports.getLeasesExpiringSoon = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const leases = await reportsService.getLeasesExpiringSoon(days);
    res.status(200).json({ status: 'success', results: leases.length, data: { leases } });
});
exports.getOutstandingPayments = (0, catchAsync_1.catchAsync)(async (req, res, next) => {
    const invoices = await reportsService.getOutstandingPayments();
    res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
});
