import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { parkingSpotRepository } from "../repositories/parking-spot.repository";

const ensureTargetIsAvailable = async (tx: Prisma.TransactionClient, spotId: number, userId: number) => {
  const spot = await tx.parkingSpot.findUnique({
    where: { id: spotId },
    include: {
      sessions: { where: { status: "ACTIVE" }, include: { vehicle: true } },
    },
  });
  if (!spot) throw { status: 404, message: "El espacio de estacionamiento no existe" };
  if (spot.assignedUserId !== null && spot.assignedUserId !== userId) {
    throw { status: 409, message: "Este espacio ya está asignado a otro cliente" };
  }
  const foreignSession = spot.sessions.find((session) => session.vehicle.userId !== userId);
  if (foreignSession) throw { status: 409, message: "Este espacio está ocupado por otro vehículo" };
  return spot;
};

export const parkingSpotService = {
  getSpots: () => parkingSpotRepository.findAll(),
  getSpotById: (id: number) => parkingSpotRepository.findById(id),
  getSpotsByFloorId: (floorId: number) => parkingSpotRepository.findByFloorId(floorId),

  async getOccupancyStats() {
    const [total, occupied] = await Promise.all([
      parkingSpotRepository.count(),
      parkingSpotRepository.countOccupied(),
    ]);
    return { total, occupied, available: total - occupied };
  },

  getAvailableSpots() {
    return prisma.parkingSpot.findMany({
      where: {
        assignedUserId: null,
        sessions: { none: { status: "ACTIVE" } },
      },
      select: { id: true, label: true, spotType: true, floor: { select: { name: true, level: true } } },
      orderBy: [{ floor: { level: "asc" } }, { row: "asc" }, { column: "asc" }],
    });
  },

  updateSpot(id: number, data: Prisma.ParkingSpotUpdateInput) {
    return parkingSpotRepository.update(id, data);
  },

  async selectSpot(userId: number, spotId: number | null) {
    return prisma.$transaction(async (tx) => {
      if (spotId === null) {
        await tx.parkingSpot.updateMany({ where: { assignedUserId: userId }, data: { assignedUserId: null } });
        return { success: true, message: "Cochera liberada con éxito" };
      }

      await ensureTargetIsAvailable(tx, spotId, userId);
      await tx.parkingSpot.updateMany({ where: { assignedUserId: userId }, data: { assignedUserId: null } });
      const claimed = await tx.parkingSpot.updateMany({
        where: { id: spotId, OR: [{ assignedUserId: null }, { assignedUserId: userId }] },
        data: { assignedUserId: userId },
      });
      if (claimed.count !== 1) throw { status: 409, message: "La cochera acaba de ser elegida por otro cliente" };
      const activeSession = await tx.parkingSession.findFirst({
        where: { status: "ACTIVE", vehicle: { userId } },
      });
      if (activeSession && activeSession.spotId !== spotId) {
        await tx.parkingSpot.update({ where: { id: activeSession.spotId }, data: { isOccupied: false } });
        await tx.parkingSession.update({ where: { id: activeSession.id }, data: { spotId } });
        await tx.parkingSpot.update({ where: { id: spotId }, data: { isOccupied: true } });
      }
      return { success: true, message: "Cochera asignada con éxito" };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },

  async assignSpotAsAdmin(spotId: number, userId: number | null) {
    return prisma.$transaction(async (tx) => {
      const target = await tx.parkingSpot.findUnique({ where: { id: spotId } });
      if (!target) throw { status: 404, message: "Cochera no encontrada" };

      if (userId === null) {
        return tx.parkingSpot.update({ where: { id: spotId }, data: { assignedUserId: null } });
      }

      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { vehicles: { select: { id: true }, take: 1 } },
      });
      if (!user || user.role === "ADMIN") throw { status: 400, message: "Solo se pueden asignar clientes o invitados" };
      if (user.vehicles.length === 0) throw { status: 400, message: "El cliente no tiene un vehículo registrado" };

      await ensureTargetIsAvailable(tx, spotId, userId);
      const activeSession = await tx.parkingSession.findFirst({
        where: { status: "ACTIVE", vehicle: { userId } },
      });

      await tx.parkingSpot.updateMany({ where: { assignedUserId: userId }, data: { assignedUserId: null } });
      if (activeSession && activeSession.spotId !== spotId) {
        await tx.parkingSpot.update({ where: { id: activeSession.spotId }, data: { isOccupied: false } });
        await tx.parkingSession.update({ where: { id: activeSession.id }, data: { spotId } });
      }

      return tx.parkingSpot.update({
        where: { id: spotId },
        data: { assignedUserId: userId, isOccupied: Boolean(activeSession) },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },

  async moveSessionAsAdmin(spotId: number, sessionId: number) {
    return prisma.$transaction(async (tx) => {
      const session = await tx.parkingSession.findUnique({
        where: { id: sessionId },
        include: { vehicle: true },
      });
      if (!session || session.status !== "ACTIVE") throw { status: 404, message: "La sesión ya no está activa" };
      if (session.spotId === spotId) return session;
      const target = await tx.parkingSpot.findUnique({
        where: { id: spotId },
        include: { sessions: { where: { status: "ACTIVE" } } },
      });
      if (!target || target.sessions.length > 0) throw { status: 409, message: "El lugar destino está ocupado" };
      if (target.assignedUserId && target.assignedUserId !== session.vehicle.userId) {
        throw { status: 409, message: "El lugar destino está reservado para otro cliente" };
      }
      if (session.vehicle.userId) {
        await tx.parkingSpot.updateMany({ where: { assignedUserId: session.vehicle.userId }, data: { assignedUserId: null } });
      }
      await tx.parkingSpot.update({ where: { id: session.spotId }, data: { isOccupied: false } });
      await tx.parkingSession.update({ where: { id: sessionId }, data: { spotId } });
      await tx.parkingSpot.update({
        where: { id: spotId },
        data: { isOccupied: true, assignedUserId: session.vehicle.userId },
      });
      return session;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },

  async relocateAsAdmin(originSpotId: number, targetSpotId: number) {
    if (originSpotId === targetSpotId) throw { status: 400, message: "Elegí un lugar diferente" };
    return prisma.$transaction(async (tx) => {
      const spots = await tx.parkingSpot.findMany({
        where: { id: { in: [originSpotId, targetSpotId] } },
        include: { sessions: { where: { status: "ACTIVE" }, take: 1 } },
      });
      const origin = spots.find((spot) => spot.id === originSpotId);
      const target = spots.find((spot) => spot.id === targetSpotId);
      if (!origin || !target) throw { status: 404, message: "No se encontró uno de los lugares" };
      const originSession = origin.sessions[0];
      const targetSession = target.sessions[0];
      if (!originSession && origin.assignedUserId === null) {
        throw { status: 400, message: "El lugar seleccionado no tiene un vehículo ni una reserva" };
      }

      if (originSession) await tx.parkingSession.update({ where: { id: originSession.id }, data: { spotId: target.id } });
      if (targetSession) await tx.parkingSession.update({ where: { id: targetSession.id }, data: { spotId: origin.id } });
      await tx.parkingSpot.updateMany({ where: { id: { in: [origin.id, target.id] } }, data: { assignedUserId: null } });
      await tx.parkingSpot.update({
        where: { id: origin.id },
        data: { assignedUserId: target.assignedUserId, isOccupied: Boolean(targetSession) },
      });
      await tx.parkingSpot.update({
        where: { id: target.id },
        data: { assignedUserId: origin.assignedUserId, isOccupied: Boolean(originSession) },
      });
      return { originSpotId, targetSpotId, swapped: Boolean(targetSession || target.assignedUserId) };
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },
};
