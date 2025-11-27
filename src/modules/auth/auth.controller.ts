import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { catchAsync } from '../../utils/catchAsync';
import { z } from 'zod';

const authService = new AuthService();

const registerSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = registerSchema.parse(req.body);
  const { user, token } = await authService.register({
    fullName: data.fullName,
    email: data.email,
    passwordHash: data.password,
    // role is not passed, defaults to STAFF in service/db
  });

  res.status(201).json({
    status: 'success',
    token,
    data: { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = loginSchema.parse(req.body);
  const { user, token } = await authService.login(data.email, data.password);

  res.status(200).json({
    status: 'success',
    token,
    data: { user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
  });
});
