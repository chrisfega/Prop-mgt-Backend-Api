import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';
import { TicketStatus, TicketPriority, TicketReporter } from '@prisma/client';

export class MaintenanceService {
  async findAll() {
    return prisma.maintenanceTicket.findMany({
      include: {
        property: true,
        unit: true,
        tenant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(data: {
    propertyId: string;
    unitId?: string;
    tenantId?: string;
    title: string;
    description: string;
    priority?: TicketPriority;
    reportedBy: TicketReporter;
  }) {
    return prisma.maintenanceTicket.create({
      data: {
        ...data,
        status: TicketStatus.NEW,
      },
    });
  }

  async updateStatus(id: string, status: TicketStatus) {
    const ticket = await prisma.maintenanceTicket.findUnique({ where: { id } });
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    return prisma.maintenanceTicket.update({
      where: { id },
      data: { status },
    });
  }
}
