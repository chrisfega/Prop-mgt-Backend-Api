import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';
import { LeaseStatus, PaymentFrequency, InvoiceType, InvoiceStatus } from '@prisma/client';

export class LeaseService {
  async createLease(data: any) {
    // 1. Validate unit availability
    const unit = await prisma.unit.findUnique({ where: { id: data.unitId } });
    if (!unit) throw new AppError('Unit not found', 404);
    if (unit.status !== 'VACANT') throw new AppError('Unit is not vacant', 400);

    // 2. Create Lease
    const lease = await prisma.lease.create({
      data: {
        ...data,
        status: 'ACTIVE',
      },
    });

    // 3. Update Unit status and currentTenant
    await prisma.unit.update({
      where: { id: data.unitId },
      data: {
        status: 'OCCUPIED',
        // currentTenantId: data.tenantId // Removed column, now handled by Tenant side or virtual
      },
    });

    // 4. Update Tenant currentUnit
    await prisma.tenant.update({
      where: { id: data.tenantId },
      data: {
        currentUnitId: data.unitId,
        status: 'ACTIVE',
      },
    });

    // 5. Generate Rent Schedule (Invoices)
    await this.generateRentSchedule(lease);

    return lease;
  }

  async generateRentSchedule(lease: any) {
    const invoices = [];
    let currentDate = new Date(lease.startDate);
    const endDate = new Date(lease.endDate);

    while (currentDate < endDate) {
      invoices.push({
        leaseId: lease.id,
        tenantId: lease.tenantId,
        unitId: lease.unitId,
        dueDate: new Date(currentDate),
        amount: lease.rentAmount,
        type: InvoiceType.RENT,
        status: InvoiceStatus.PENDING,
      });

      // Increment date based on frequency
      if (lease.paymentFrequency === PaymentFrequency.MONTHLY) {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (lease.paymentFrequency === PaymentFrequency.QUARTERLY) {
        currentDate.setMonth(currentDate.getMonth() + 3);
      } else if (lease.paymentFrequency === PaymentFrequency.YEARLY) {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    if (invoices.length > 0) {
      await prisma.invoice.createMany({
        data: invoices,
      });
    }
  }

  async getAllLeases() {
    return prisma.lease.findMany({
      include: {
        tenant: true,
        unit: {
            include: {
                property: true
            }
        },
      },
    });
  }

  async getLeaseById(id: string) {
    const lease = await prisma.lease.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: {
            include: {
                property: true
            }
        },
        invoices: true,
      },
    });

    if (!lease) {
      throw new AppError('Lease not found', 404);
    }

    return lease;
  }

  async terminateLease(id: string) {
      const lease = await this.getLeaseById(id);
      
      // Update lease status
      await prisma.lease.update({
          where: { id },
          data: { status: 'TERMINATED', endDate: new Date() } // Set end date to now
      });

      // Update unit status
      await prisma.unit.update({
          where: { id: lease.unitId },
          data: { status: 'VACANT' }
      });

      // Update tenant status
      await prisma.tenant.update({
          where: { id: lease.tenantId },
          data: { currentUnitId: null, status: 'MOVED_OUT' }
      });
      
      // Cancel future pending invoices?
      // For MVP, leave them or mark as cancelled if we had that status.
  }
}
