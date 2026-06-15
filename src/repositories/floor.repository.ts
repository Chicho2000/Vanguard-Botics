import { prisma } from "../lib/prisma";

export const floorRepository = {
  async getFloorsOverview() {
    return await prisma.floor.findMany({
      include: {
        spots: {
          select: {
            id: true,
            label: true,
            isOccupied: true,
            spotType: true,
            row: true,
            column: true,
            sessions: {
              where: { status: "ACTIVE" },
              take: 1,
              select: {
                entryAt: true,
                vehicle: {
                  select: {
                    userId: true,
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
