import prisma from '../../database/prisma';
import { TenantStatus } from '@prisma/client';
import { AppError } from '../../utils/AppError';

export class TenantService {
  async createTenant(data: any) {
    return prisma.tenant.create({
      data: {
        ...data,
        email: data.email === '' ? undefined : data.email,
      },
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
      data: {
        ...data,
        email: data.email === '' ? null : data.email,
      },
    });
    return tenant;
  }

  async deleteTenant(id: string) {
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) {
      throw new AppError('Tenant not found', 404);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete documents
      await tx.document.deleteMany({ where: { tenantId: id } });

      // 2. Delete leases
      await tx.lease.deleteMany({ where: { tenantId: id } });

      // 3. Delete invoices and payments
      const invoices = await tx.invoice.findMany({ where: { tenantId: id } });
      if (invoices.length > 0) {
        const invoiceIds = invoices.map(inv => inv.id);
        await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
        await tx.invoice.deleteMany({ where: { tenantId: id } });
      }

      // 4. Delete tickets
      await tx.maintenanceTicket.deleteMany({ where: { tenantId: id } });

      // 5. Delete tenant
      await tx.tenant.delete({ where: { id } });
    });
  }
}
