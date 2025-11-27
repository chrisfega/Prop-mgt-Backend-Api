import prisma from '../../database/prisma';
import { TenantStatus } from '@prisma/client';
import { AppError } from '../../utils/AppError';

export class TenantService {
  async createTenant(data: any) {
    return prisma.tenant.create({
      data,
    });
  }

  async getAllTenants() {
    return prisma.tenant.findMany({
      include: {
        currentUnit: {
          include: {
            property: true,
          },
        },
      },
    });
  }

  async getTenantById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        currentUnit: {
          include: {
            property: true,
          },
        },
        leases: true,
        invoices: true,
        documents: true,
      },
    });

    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    return tenant;
  }

  async updateTenant(id: string, data: any) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data,
    });
    return tenant;
  }

  async deleteTenant(id: string) {
    await prisma.tenant.delete({
      where: { id },
    });
  }
}
