import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const userRepository = {
  async count(): Promise<number> {
    return await prisma.user.count();
  },

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async findMany() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
        vehicles: {
          select: {
            licensePlate: true,
            brand: true,
            model: true,
            color: true,
          },
        },
      },
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
    });
  },

  async update(id: number, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // 1. Find all subscriptions of the user
      const subscriptions = await tx.subscription.findMany({
        where: { userId: id },
        select: { id: true },
      });
      const subIds = subscriptions.map((s) => s.id);

      // 2. Find all vehicles of the user
      const vehicles = await tx.vehicle.findMany({
        where: { userId: id },
        select: { id: true },
      });
      const vehIds = vehicles.map((v) => v.id);

      // 3. Find all parking sessions of these vehicles
      const sessions = await tx.parkingSession.findMany({
        where: { vehicleId: { in: vehIds } },
        select: { id: true, spotId: true, status: true },
      });
      const sessionIds = sessions.map((s) => s.id);

      // 4. If any sessions are active, free their spots
      const activeSessions = sessions.filter((s) => s.status === "ACTIVE");
      if (activeSessions.length > 0) {
        const spotIds = activeSessions.map((s) => s.spotId);
        await tx.parkingSpot.updateMany({
          where: { id: { in: spotIds } },
          data: { isOccupied: false },
        });
      }

      // 5. Delete payments associated with these subscriptions or sessions
      await tx.payment.deleteMany({
        where: {
          OR: [
            { subscriptionId: { in: subIds } },
            { sessionId: { in: sessionIds } },
          ],
        },
      });

      // 6. Delete parking sessions
      await tx.parkingSession.deleteMany({
        where: { id: { in: sessionIds } },
      });

      // 7. Delete subscriptions
      await tx.subscription.deleteMany({
        where: { id: { in: subIds } },
      });

      // 8. Delete vehicles
      await tx.vehicle.deleteMany({
        where: { id: { in: vehIds } },
      });

      // 9. Delete the user
      await tx.user.delete({
        where: { id },
      });
    });
  },
};
