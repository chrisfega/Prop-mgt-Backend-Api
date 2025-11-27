import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';

export class LandlordsService {
  async findAll() {
    return prisma.landlord.findMany({
      include: {
        properties: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findById(id: string) {
    const landlord = await prisma.landlord.findUnique({
      where: { id },
      include: {
        properties: true,
      },
    });

    if (!landlord) {
      throw new AppError('Landlord not found', 404);
    }

    return landlord;
  }

  async create(data: {
    fullName: string;
    email: string;
    phone: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountName?: string;
    notes?: string;
  }) {
    return prisma.landlord.create({
      data,
    });
  }

  async update(id: string, data: any) {
    const landlord = await prisma.landlord.findUnique({ where: { id } });
    if (!landlord) {
      throw new AppError('Landlord not found', 404);
    }

    return prisma.landlord.update({
      where: { id },
      data,
    });
  }
}
