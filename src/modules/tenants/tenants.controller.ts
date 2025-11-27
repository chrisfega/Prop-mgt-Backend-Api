import { Request, Response, NextFunction } from 'express';
import { TenantService } from './tenants.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const tenantService = new TenantService();

const createTenantSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  status: z.enum(['ACTIVE', 'MOVED_OUT', 'EVICTED', 'PENDING']).optional(),
});

const updateTenantSchema = createTenantSchema.partial();

export const createTenant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createTenantSchema.parse(req.body);
  const tenant = await tenantService.createTenant(data);
  res.status(201).json({ status: 'success', data: { tenant } });
});

export const getAllTenants = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tenants = await tenantService.getAllTenants();
  res.status(200).json({ status: 'success', results: tenants.length, data: { tenants } });
});

export const getTenantById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tenant = await tenantService.getTenantById(req.params.id);
  res.status(200).json({ status: 'success', data: { tenant } });
});

export const updateTenant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = updateTenantSchema.parse(req.body);
  const tenant = await tenantService.updateTenant(req.params.id, data);
  res.status(200).json({ status: 'success', data: { tenant } });
});

export const deleteTenant = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await tenantService.deleteTenant(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});
