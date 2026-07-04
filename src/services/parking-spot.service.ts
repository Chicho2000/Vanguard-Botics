import { parkingSpotRepository } from "../repositories/parking-spot.repository";
import { prisma } from "../lib/prisma";

export const parkingSpotService = {
  async getSpots() {
    return await parkingSpotRepository.findAll();
  },

  async getSpotById(id: number) {
    return await parkingSpotRepository.findById(id);
  },

  async getSpotsByFloorId(floorId: number) {
    return await parkingSpotRepository.findByFloorId(floorId);
  },

  async getOccupancyStats() {
    const total = await parkingSpotRepository.count();
    const occupied = await parkingSpotRepository.countOccupied();
    return { total, occupied, available: total - occupied };
  },

  async updateSpot(id: number, data: any) {
    return await parkingSpotRepository.update(id, data);
  },

  async selectSpot(userId: number, spotId: number | null) {
    // 1. If spotId is null, release the user's current chosen spot if any
    if (spotId === null) {
      await prisma.parkingSpot.updateMany({
        where: { assignedUserId: userId },
        data: { assignedUserId: null }
      });
      return { success: true, message: "Cochera liberada con éxito" };
    }

    // 2. Fetch the spot
    const spot = await prisma.parkingSpot.findUnique({
      where: { id: spotId },
      include: {
        sessions: {
          where: { status: "ACTIVE" }
        }
      }
    });

    if (!spot) {
      throw new Error("El espacio de estacionamiento no existe");
    }

    // 3. Check if it's already assigned to another user
    if (spot.assignedUserId !== null && spot.assignedUserId !== userId) {
      throw new Error("Este espacio ya está asignado a otro cliente");
    }

    // 4. Check if it is occupied by an active session from another user's vehicle
    if (spot.sessions.length > 0) {
      const activeSession = spot.sessions[0];
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: activeSession.vehicleId }
      });
      if (!vehicle || vehicle.userId !== userId) {
        throw new Error("Este espacio está actualmente ocupado por otro vehículo");
      }
    }

    // 5. Release any previously chosen spot for this user and assign the new one in a transaction
    await prisma.$transaction([
      prisma.parkingSpot.updateMany({
        where: { assignedUserId: userId },
        data: { assignedUserId: null }
      }),
      prisma.parkingSpot.update({
        where: { id: spotId },
        data: { assignedUserId: userId }
      })
    ]);

    return { success: true, message: "Cochera asignada con éxito" };
  }
};
