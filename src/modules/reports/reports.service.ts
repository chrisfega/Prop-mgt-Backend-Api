import prisma from '../../database/prisma';

export class ReportsService {
  async getDashboardSummary() {
    const totalProperties = await prisma.property.count();
    const totalUnits = await prisma.unit.count();
    const totalOccupiedUnits = await prisma.unit.count({ where: { status: 'OCCUPIED' } });
    const totalVacantUnits = await prisma.unit.count({ where: { status: 'VACANT' } });
    const totalTenants = await prisma.tenant.count();
    const totalLandlords = await prisma.landlord.count();

    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);

    const currentMonthEnd = new Date(currentMonthStart);
    currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1);

    const rentDueThisMonth = await prisma.invoice.aggregate({
        where: {
            type: 'RENT',
            dueDate: {
                gte: currentMonthStart,
                lt: currentMonthEnd
            }
        },
        _sum: {
            amount: true
        }
    });

    const rentCollectedThisMonth = await prisma.payment.aggregate({
        where: {
            paymentDate: {
                gte: currentMonthStart,
                lt: currentMonthEnd
            },
            invoice: {
                type: 'RENT'
            }
        },
        _sum: {
            amount: true
        }
    });

    const overdueInvoices = await prisma.invoice.aggregate({
        where: {
            status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
            dueDate: { lt: new Date() }
        },
        _sum: {
            amount: true
        }
    });

    return {
        totalProperties,
        totalUnits,
        totalOccupiedUnits,
        totalVacantUnits,
        totalTenants,
        totalLandlords,
        totalRentDueThisMonth: rentDueThisMonth._sum.amount || 0,
        totalRentCollectedThisMonth: rentCollectedThisMonth._sum.amount || 0,
        totalOverdueAmount: overdueInvoices._sum.amount || 0
    };
  }

  async getLeasesExpiringSoon(days: number = 30) {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      return prisma.lease.findMany({
          where: {
              endDate: {
                  gte: today,
                  lte: futureDate
              },
              status: 'ACTIVE'
          },
          include: {
              tenant: true,
              unit: true
          }
      });
  }

  async getOutstandingPayments() {
      return prisma.invoice.findMany({
          where: {
              status: { in: ['PENDING', 'PARTIALLY_PAID', 'OVERDUE'] },
              dueDate: { lt: new Date() }
          },
          include: {
              tenant: true
          }
      });
  }
}
