import { Request, Response, NextFunction } from 'express';
import { InvoiceService } from './invoices.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const invoiceService = new InvoiceService();

const createInvoiceSchema = z.object({
  tenantId: z.string(),
  leaseId: z.string().optional(),
  unitId: z.string().optional(),
  amount: z.number(),
  dueDate: z.string().transform((str) => new Date(str)),
  type: z.enum(['RENT', 'SERVICE_CHARGE', 'MAINTENANCE_FEE', 'OTHER']),
});

const updateInvoiceSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'PARTIALLY_PAID', 'OVERDUE', 'CANCELLED']).optional(),
  amount: z.number().optional(),
  dueDate: z.string().transform((str) => new Date(str)).optional(),
});

export const createInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createInvoiceSchema.parse(req.body);
  const invoice = await invoiceService.createInvoice(data);
  res.status(201).json({ status: 'success', data: { invoice } });
});

export const getAllInvoices = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const invoices = await invoiceService.getAllInvoices();
  res.status(200).json({ status: 'success', results: invoices.length, data: { invoices } });
});

export const getInvoiceById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id);
  res.status(200).json({ status: 'success', data: { invoice } });
});

export const updateInvoice = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = updateInvoiceSchema.parse(req.body);
  const invoice = await invoiceService.updateInvoice(req.params.id, data);
  res.status(200).json({ status: 'success', data: { invoice } });
});

export const getRemindersPreview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const upcoming = await invoiceService.getUpcomingInvoicesForReminder();
    const overdue = await invoiceService.getOverdueInvoicesForReminder();
    res.status(200).json({ status: 'success', data: { upcoming, overdue } });
});

export const sendReminders = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Stub implementation
    console.log('Sending reminders...');
    res.status(200).json({ status: 'success', message: 'Reminders sent (simulated)' });
});
