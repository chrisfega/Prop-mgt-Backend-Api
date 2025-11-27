import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '@prisma/client';
import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';
import { env } from '../../config/env';

export class AuthService {
  async register(data: { fullName: string; email: string; passwordHash: string; role?: Role }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const hashedPassword = await bcrypt.hash(data.passwordHash, 12);

    const user = await prisma.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        passwordHash: hashedPassword,
        role: data.role || Role.STAFF,
      },
    });

    const token = this.signToken(user.id);

    return { user, token };
  }

  async login(email: string, passwordHash: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(passwordHash, user.passwordHash))) {
      throw new AppError('Incorrect email or password', 401);
    }

    const token = this.signToken(user.id);

    return { user, token };
  }

  private signToken(id: string) {
    return jwt.sign({ id }, env.JWT_SECRET, {
      expiresIn: '1d',
    });
  }
}
