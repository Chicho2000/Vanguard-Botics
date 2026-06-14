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
};
