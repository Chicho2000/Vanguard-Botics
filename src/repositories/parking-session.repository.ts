import { prisma } from "../lib/prisma";

export const parkingSessionRepository = {
  async countActive(): Promise<number> {
    return await prisma.parkingSession.count({
      where: { status: "ACTIVE" },
    });
  },

  async findRecent(limit: number = 10) {
    return await prisma.parkingSession.findMany({
      orderBy: { entryAt: "desc" },
      take: limit,
      include: {
        vehicle: {
          select: {
            userId: true,
            user: { select: { role: true } },
            licensePlate: true,
            brand: true,
            model: true,
          },
        },
        spot: {
          select: {
            label: true,
            floor: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  },

  async findActiveByLicensePlate(licensePlate: string) {
    return await prisma.parkingSession.findFirst({
      where: {
        status: "ACTIVE",
        vehicle: { licensePlate },
      },
      orderBy: { entryAt: "desc" },
      include: {
        vehicle: true,
        spot: { include: { floor: true } },
        payment: true,
      },
    });
  },

  async findActiveByUserId(userId: number) {
    return await prisma.parkingSession.findFirst({
      where: {
        status: "ACTIVE",
        vehicle: { userId },
      },
      orderBy: { entryAt: "desc" },
      include: {
        vehicle: true,
        spot: { include: { floor: true } },
        payment: true,
      },
    });
  },

  async findHistory(limit = 100) {
    return prisma.parkingSession.findMany({
      take: limit,
      orderBy: { entryAt: "desc" },
      include: {
        vehicle: { include: { user: { select: { id: true, name: true, email: true } } } },
        spot: { include: { floor: true } },
        payment: true,
      },
    });
  },
};
