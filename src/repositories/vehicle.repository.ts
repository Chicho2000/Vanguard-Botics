import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const vehicleRepository = {
  async count(): Promise<number> {
    return await prisma.vehicle.count();
  },

  async findAll() {
    return await prisma.vehicle.findMany({
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async findById(id: number) {
    return await prisma.vehicle.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  },

  async findByLicensePlate(licensePlate: string) {
    return await prisma.vehicle.findUnique({
      where: { licensePlate },
    });
  },

  async findByUserId(userId: number) {
    return await prisma.vehicle.findMany({
      where: { userId },
    });
  },

  async create(data: Prisma.VehicleCreateInput) {
    return await prisma.vehicle.create({
      data,
    });
  },

  async update(id: number, data: Prisma.VehicleUpdateInput) {
    return await prisma.vehicle.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.vehicle.delete({
      where: { id },
    });
  },
};
