import { prisma } from "../lib/prisma";

export const adminRepository = {
  async countUsers() {
    return await prisma.user.count();
  },

  async countVehicles() {
    return await prisma.vehicle.count();
  },

  async countTotalSpots() {
    return await prisma.parkingSpot.count();
  },

  async countOccupiedSpots() {
    return await prisma.parkingSpot.count({
      where: { isOccupied: true },
    });
  },

  async countActiveSessions() {
    return await prisma.parkingSession.count({
      where: { status: "ACTIVE" },
    });
  },

  async getRecentSessions(limit: number = 10) {
    return await prisma.parkingSession.findMany({
      orderBy: { entryAt: "desc" },
      take: limit,
      include: {
        vehicle: { select: { licensePlate: true, brand: true, model: true } },
        spot: {
          select: {
            label: true,
            floor: { select: { name: true } },
          },
        },
      },
    });
  },

  async getTodayRevenue() {
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

  async getFloors() {
    return await prisma.floor.findMany({
      include: {
        spots: {
          select: {
            id: true,
            label: true,
            isOccupied: true,
            spotType: true,
            sessions: {
              where: { status: "ACTIVE" },
              take: 1,
              select: {
                entryAt: true,
                vehicle: {
                  select: {
                    licensePlate: true,
                    brand: true,
                    model: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { level: "asc" },
    });
  },
};
