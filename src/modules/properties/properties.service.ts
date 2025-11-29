import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';

export class PropertyService {
  async createProperty(data: any) {
    const { units, ...propertyData } = data;
    
    return prisma.property.create({
      data: {
        ...propertyData,
        units: units ? {
          create: units
        } : undefined,
      },
      include: {
        units: true,
      }
    });
  }

  async getAllProperties() {
    return prisma.property.findMany({
      include: {
        units: true,
        landlord: true,
      },
    });
  }

  async getPropertyById(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        units: {
            include: {
                currentTenant: true
            }
        },
        landlord: true,
        tickets: true,
      },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    return property;
  }

  async updateProperty(id: string, data: any) {
    const { units, ...propertyData } = data;

    const property = await prisma.property.update({
      where: { id },
      data: {
        ...propertyData,
        units: units ? {
          create: units
        } : undefined,
      },
    });
    return property;
  }

  async deleteProperty(id: string) {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { units: true },
    });

    if (!property) {
      throw new AppError('Property not found', 404);
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete tickets related to the property
      await tx.maintenanceTicket.deleteMany({
        where: { propertyId: id },
      });

      // 2. Handle units and their related records
      for (const unit of property.units) {
        // Delete leases related to unit
        await tx.lease.deleteMany({ where: { unitId: unit.id } });
        
        // Delete invoices related to unit
        // First delete payments for these invoices
        const invoices = await tx.invoice.findMany({ where: { unitId: unit.id } });
        if (invoices.length > 0) {
            const invoiceIds = invoices.map(inv => inv.id);
            await tx.payment.deleteMany({ where: { invoiceId: { in: invoiceIds } } });
            await tx.invoice.deleteMany({ where: { unitId: unit.id } });
        }

        // Disconnect current tenant
        await tx.tenant.updateMany({
          where: { currentUnitId: unit.id },
          data: { currentUnitId: null },
        });
      }

      // 3. Delete units
      await tx.unit.deleteMany({ where: { propertyId: id } });

      // 4. Delete property
      await tx.property.delete({ where: { id } });
    });
  }

  // Unit methods
  async createUnit(propertyId: string, data: any) {
    return prisma.unit.create({
      data: {
        ...data,
        propertyId,
      },
    });
  }

  async updateUnit(id: string, data: any) {
    return prisma.unit.update({
        where: { id },
        data
    })
  }

  async deleteUnit(id: string) {
      return prisma.unit.delete({
          where: { id }
      })
  }

  async getVacantUnits() {
      return prisma.unit.findMany({
          where: {
              status: 'VACANT'
          },
          include: {
              property: true
          }
      })
  }
}
