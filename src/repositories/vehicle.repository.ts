import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const vehicleRepository = {
  async count(): Promise<number> {
    return await prisma.vehicle.count();
  },

  async findByLicensePlate(licensePlate: string) {
    return await prisma.vehicle.findUnique({
      where: { licensePlate },
    });
  },

  async create(data: Prisma.VehicleCreateInput) {
    return await prisma.vehicle.create({
      data,
    });
  },
};
