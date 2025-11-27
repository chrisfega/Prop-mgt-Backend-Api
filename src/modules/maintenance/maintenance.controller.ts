import { Request, Response, NextFunction } from 'express';
import { MaintenanceService } from './maintenance.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const maintenanceService = new MaintenanceService();

const createTicketSchema = z.object({
  propertyId: z.string().uuid(),
  unitId: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
});

export const getAllTickets = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const tickets = await maintenanceService.findAll();

  res.status(200).json({
    status: 'success',
    data: {
      tickets,
    },
  });
});

export const createTicket = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createTicketSchema.parse(req.body);
  
  // Assuming logged in user is STAFF/ADMIN, we might need to handle TENANT reporting differently
  // For now, we'll assume STAFF reporting or infer from context. 
  // If we had tenant auth, we'd pull tenantId from req.user
  
  const ticket = await maintenanceService.create({
    ...data,
    reportedBy: 'STAFF', // Defaulting to STAFF for dashboard usage
  });

  res.status(201).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});

export const updateTicketStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = updateStatusSchema.parse(req.body);
  const ticket = await maintenanceService.updateStatus(req.params.id, status as any);

  res.status(200).json({
    status: 'success',
    data: {
      ticket,
    },
  });
});
