import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';

export class InvoiceService {
  async createInvoice(data: any) {
    return prisma.invoice.create({
      data: {
        ...data,
        status: 'PENDING',
      },
      include: {
        tenant: true,
        unit: true,
      }
    });
  }

  async getAllInvoices() {
    return prisma.invoice.findMany({
      include: {
        tenant: true,
        unit: true,
        payments: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  async getInvoiceById(id: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: true,
        unit: true,
        payments: true,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    return invoice;
  }

  async updateInvoice(id: string, data: any) {
    const invoice = await prisma.invoice.update({
      where: { id },
      data,
      include: {
        tenant: true,
        unit: true
      }
    });
    return invoice;
  }

  async getUpcomingInvoicesForReminder() {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);

      return prisma.invoice.findMany({
          where: {
              dueDate: {
                  gte: today,
                  lte: nextWeek
              },
              status: 'PENDING'
          },
          include: {
              tenant: true
          }
      });
  }

  async getOverdueInvoicesForReminder() {
      const today = new Date();
      return prisma.invoice.findMany({
          where: {
              dueDate: {
                  lt: today
              },
              status: {
                  in: ['PENDING', 'PARTIALLY_PAID']
              }
          },
          include: {
              tenant: true
          }
      });
  }
}
