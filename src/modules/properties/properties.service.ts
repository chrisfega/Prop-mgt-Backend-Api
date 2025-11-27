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
    await prisma.property.delete({
      where: { id },
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
