import { Request, Response, NextFunction } from 'express';
import { LeaseService } from './leases.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const leaseService = new LeaseService();

const createLeaseSchema = z.object({
  tenantId: z.string(),
  unitId: z.string(),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  rentAmount: z.number(),
  paymentFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  securityDepositAmount: z.number().optional(),
});

export const createLease = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createLeaseSchema.parse(req.body);
  const lease = await leaseService.createLease(data);
  res.status(201).json({ status: 'success', data: { lease } });
});

export const getAllLeases = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const leases = await leaseService.getAllLeases();
  res.status(200).json({ status: 'success', results: leases.length, data: { leases } });
});

export const getLeaseById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const lease = await leaseService.getLeaseById(req.params.id);
  res.status(200).json({ status: 'success', data: { lease } });
});

export const terminateLease = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    await leaseService.terminateLease(req.params.id);
    res.status(200).json({ status: 'success', message: 'Lease terminated successfully' });
});
