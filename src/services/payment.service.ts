import { paymentRepository } from "../repositories/payment.repository";
import { prisma } from "../lib/prisma";

export const paymentService = {
  async getPayments() {
    return await prisma.payment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        session: true,
        subscription: true,
      },
    });
  },

  async getPaymentById(id: number) {
    return await prisma.payment.findUnique({
      where: { id },
      include: {
        session: true,
        subscription: true,
      },
    });
  },

  async getPaymentsBySessionId(sessionId: number) {
    return await prisma.payment.findUnique({
      where: { sessionId },
    });
  },

  async getPaymentsBySubscriptionId(subscriptionId: number) {
    return await prisma.payment.findUnique({
      where: { subscriptionId },
    });
  },

  async getTodayRevenue() {
    return await paymentRepository.getTodayRevenue();
  },
};
