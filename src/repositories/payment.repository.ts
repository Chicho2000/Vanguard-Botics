import { prisma } from "../lib/prisma";

export const paymentRepository = {
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
