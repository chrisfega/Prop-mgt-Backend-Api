import { Request, Response, NextFunction } from 'express';
import { PaymentService } from './payments.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const paymentService = new PaymentService();

const createPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().min(0),
  method: z.enum(['BANK_TRANSFER', 'CASH', 'CARD', 'OTHER']),
  reference: z.string().optional(),
});

export const recordPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createPaymentSchema.parse(req.body);
  const payment = await paymentService.recordPayment(data);
  res.status(201).json({ status: 'success', data: { payment } });
});

export const getAllPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payments = await paymentService.getAllPayments();
  res.status(200).json({ status: 'success', results: payments.length, data: { payments } });
});
