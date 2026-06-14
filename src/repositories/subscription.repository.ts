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
};
