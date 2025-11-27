import { Request, Response, NextFunction } from 'express';
import { UsersService } from './users.service';
import { catchAsync } from '../../utils/catchAsync';

const usersService = new UsersService();

import { z } from 'zod';

const createUserSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'STAFF']),
});

const updateUserSchema = z.object({
  fullName: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(['ADMIN', 'STAFF']).optional(),
  status: z.enum(['ACTIVE', 'FROZEN']).optional(),
});

export const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = createUserSchema.parse(req.body);
  const user = await usersService.createUser({
    fullName: data.fullName,
    email: data.email,
    passwordHash: data.password,
    role: data.role as any,
  });

  res.status(201).json({
    status: 'success',
    data: { user },
  });
});

export const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const users = await usersService.findAll();

  res.status(200).json({
    status: 'success',
    data: {
      users,
    },
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = updateUserSchema.parse(req.body);
  const user = await usersService.updateUser(req.params.id, data as any);

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  await usersService.deleteUser(req.params.id);

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});
