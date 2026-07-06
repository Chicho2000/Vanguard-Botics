import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const paymentRepository = {
  findAll() {
    return prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: { session: true, subscription: true },
    });
  },
  findById(id: number) {
    return prisma.payment.findUnique({ where: { id }, include: { session: true, subscription: true } });
  },
  findBySessionId(sessionId: number) {
    return prisma.payment.findUnique({ where: { sessionId } });
  },
  findBySubscriptionId(subscriptionId: number) {
    return prisma.payment.findUnique({ where: { subscriptionId } });
  },
  create(data: Prisma.PaymentCreateInput) {
    return prisma.payment.create({ data });
  },
  updateBySubscriptionId(subscriptionId: number, amount: number, paidAt: Date) {
    return prisma.payment.upsert({
      where: { subscriptionId },
      update: { amount, paidAt, status: "APPROVED" },
      create: {
        subscriptionId,
        amount,
        paidAt,
        status: "APPROVED",
        method: "MERCADO_PAGO",
      },
    });
  },
  async getTodayRevenue(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const result = await prisma.payment.aggregate({
      _sum: { amount: true },
      where: {
        status: "APPROVED",
        paidAt: { gte: startOfDay },
      },
    });

    return result._sum.amount || 0;
  },
};
