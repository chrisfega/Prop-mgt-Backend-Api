import { Request, Response, NextFunction } from 'express';
import { PropertyService } from './properties.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';
import { uploadToImageKit } from '../../utils/imagekit';

const propertyService = new PropertyService();

const createPropertySchema = z.object({
  name: z.string().min(2),
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  description: z.string().optional(),
  type: z.enum(['APARTMENT', 'DUPLEX', 'OFFICE', 'SHOP', 'SHORT_LET', 'OTHER']),
  landlordId: z.string(),
  units: z.array(z.object({
    name: z.string(),
    monthlyRentAmount: z.number(),
    status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED', 'UNDER_MAINTENANCE']).optional(),
  })).optional(),
});

const createUnitSchema = z.object({
    name: z.string(),
    monthlyRentAmount: z.number(),
    status: z.enum(['VACANT', 'OCCUPIED', 'RESERVED', 'UNDER_MAINTENANCE']).optional()
})

export const createProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Parse units if sent as JSON string (common with FormData)
  if (req.body.units && typeof req.body.units === 'string') {
    try {
      req.body.units = JSON.parse(req.body.units);
    } catch (e) {
      // Ignore parse error, let Zod handle validation failure
    }
  }

  const data = createPropertySchema.parse(req.body);
  
  let imageUrl: string | undefined;
  
  // Upload image if provided
  if (req.file) {
    imageUrl = await uploadToImageKit(req.file, 'properties');
  }
  
  const property = await propertyService.createProperty({
    ...data,
    imageUrl,
  });
  
  res.status(201).json({ status: 'success', data: { property } });
});

export const getAllProperties = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const properties = await propertyService.getAllProperties();
  res.status(200).json({ status: 'success', results: properties.length, data: { properties } });
});

export const getPropertyById = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const property = await propertyService.getPropertyById(req.params.id);
  res.status(200).json({ status: 'success', data: { property } });
});

export const updateProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    let imageUrl: string | undefined;
  
    // Upload image if provided
    if (req.file) {
      imageUrl = await uploadToImageKit(req.file, 'properties');
    }

    // Parse units if sent as JSON string
    if (req.body.units && typeof req.body.units === 'string') {
        try {
            req.body.units = JSON.parse(req.body.units);
        } catch (e) {
            // Ignore
        }
    }

    const updateData = {
        ...req.body,
        ...(imageUrl && { imageUrl }), // Only include imageUrl if a new image was uploaded
    };

    const property = await propertyService.updateProperty(req.params.id, updateData);
    res.status(200).json({ status: 'success', data: { property } });
});

export const deleteProperty = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await propertyService.deleteProperty(req.params.id);
  res.status(204).json({ status: 'success', data: null });
});

export const createUnit = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const data = createUnitSchema.parse(req.body);
    const unit = await propertyService.createUnit(req.params.propertyId, data);
    res.status(201).json({ status: 'success', data: { unit } });
});

export const getVacantUnits = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const units = await propertyService.getVacantUnits();
    res.status(200).json({ status: 'success', results: units.length, data: { units } });
})
