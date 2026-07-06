import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const subscriptionRepository = {
  async count(): Promise<number> {
    return await prisma.subscription.count();
  },

  async findById(id: number) {
    return await prisma.subscription.findUnique({
      where: { id },
    });
  },

  async findByUserId(userId: number) {
    return await prisma.subscription.findMany({
      where: { userId },
    });
  },

  findActiveByUserId(userId: number) {
    return prisma.subscription.findFirst({
      where: { userId, status: "ACTIVE" },
      orderBy: { validUntil: "desc" },
    });
  },

  create(data: Prisma.SubscriptionCreateInput) {
    return prisma.subscription.create({ data });
  },

  update(id: number, data: Prisma.SubscriptionUpdateInput) {
    return prisma.subscription.update({ where: { id }, data });
  },

  cancelActiveByUserId(userId: number) {
    return prisma.subscription.updateMany({
      where: { userId, status: "ACTIVE" },
      data: { status: "CANCELLED" },
    });
  },
};
