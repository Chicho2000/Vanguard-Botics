import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const parkingSpotRepository = {
  async count(): Promise<number> {
    return await prisma.parkingSpot.count();
  },

  async countOccupied(): Promise<number> {
    return await prisma.parkingSpot.count({
      where: { isOccupied: true },
    });
  },

  async findAll() {
    return await prisma.parkingSpot.findMany({
      include: { floor: true },
      orderBy: [{ floorId: "asc" }, { row: "asc" }, { column: "asc" }],
    });
  },

  async findById(id: number) {
    return await prisma.parkingSpot.findUnique({
      where: { id },
      include: { floor: true },
    });
  },

  async findByFloorId(floorId: number) {
    return await prisma.parkingSpot.findMany({
      where: { floorId },
      orderBy: [{ row: "asc" }, { column: "asc" }],
    });
  },

  async update(id: number, data: Prisma.ParkingSpotUpdateInput) {
    return await prisma.parkingSpot.update({
      where: { id },
      data,
    });
  },
};
