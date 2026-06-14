import { prisma } from "../lib/prisma";

export const parkingSpotRepository = {
  async count(): Promise<number> {
    return await prisma.parkingSpot.count();
  },

  async countOccupied(): Promise<number> {
    return await prisma.parkingSpot.count({
      where: { isOccupied: true },
    });
  },
};
