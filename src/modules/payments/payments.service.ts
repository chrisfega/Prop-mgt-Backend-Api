import prisma from '../../database/prisma';
import { AppError } from '../../utils/AppError';

export class PaymentService {
  async recordPayment(data: any) {
    // 1. Verify invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id: data.invoiceId },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // 2. Create Payment
    const payment = await prisma.payment.create({
      data: {
        ...data,
        paymentDate: new Date(),
      },
    });

    // 3. Update Invoice Status
    // Simple logic: if payment amount >= invoice amount, mark as PAID, else PARTIALLY_PAID
    // In a real app, we'd sum up all payments for this invoice.
    
    const allPayments = await prisma.payment.findMany({
        where: { invoiceId: data.invoiceId }
    });
    
    const totalPaid = allPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    
    let newStatus = 'PARTIALLY_PAID';
    if (totalPaid >= Number(invoice.amount)) {
        newStatus = 'PAID';
    }

    await prisma.invoice.update({
      where: { id: data.invoiceId },
      data: { status: newStatus as any },
    });

    return payment;
  }

  async getAllPayments() {
    return prisma.payment.findMany({
      include: {
        invoice: {
          include: {
            tenant: true,
            unit: true
          }
        }
      },
      orderBy: {
        paymentDate: 'desc'
      }
    });
  }
}
