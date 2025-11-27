import { Request, Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { catchAsync } from '../../utils/catchAsync';

const reportsService = new ReportsService();

export const getDashboardSummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const summary = await reportsService.getDashboardSummary();
  res.status(200).json({ status: 'success', data: { summary } });
});

export const getLeasesExpiringSoon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const days = req.query.days ? Number(req.query.days) : 30;
    const leases = await reportsService.getLeasesExpiringSoon(days);
    res.status(200).json({ status: 'success', results: leases.length, data: { leases } });
});

export const getOutstandingPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const invoices = await reportsService.getOutstandingPayments();
    res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
});
