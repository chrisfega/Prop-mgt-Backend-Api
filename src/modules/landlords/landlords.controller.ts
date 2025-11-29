import { Request, Response, NextFunction } from 'express';
import { LandlordsService } from './landlords.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const landlordsService = new LandlordsService();

const createLandlordSchema = z.object({
  fullName: z.string().min(2),
  email: z
    .string()
    .email()
    .or(z.literal(''))
    .optional()
    .transform((val) => (val === '' ? undefined : val)),
  phone: z.string().min(10),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankAccountName: z.string().optional(),
  notes: z.string().optional(),
});
const updateLandlordSchema = createLandlordSchema.partial();

export const getAllLandlords = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const landlords = await landlordsService.findAll();

  res.status(200).json({
    status: 'success',
    data: {
      landlords,
    },
  });
});

export const getLandlord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const landlord = await landlordsService.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    data: {
      landlord,
    },
  });
});

export const createLandlord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createLandlordSchema.parse(req.body);
  const landlord = await landlordsService.create(data);

  res.status(201).json({
    status: 'success',
    data: {
      landlord,
    },
  });
});

export const updateLandlord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = updateLandlordSchema.parse(req.body);
  const landlord = await landlordsService.update(req.params.id, data);

  res.status(200).json({
    status: 'success',
    data: {
      landlord,
    },
  });
});

export const deleteLandlord = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await landlordsService.delete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
