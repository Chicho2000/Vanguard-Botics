import { parkingSessionRepository } from "../repositories/parking-session.repository";
import { systemConfigService } from "./system-config.service";
import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

const calculateBillableHours = (totalMinutes: number) => {
  if (totalMinutes < 30) return 0;
  if (totalMinutes < 60) return 0.5;
  const hours = Math.floor(totalMinutes / 60);
  return totalMinutes % 60 >= 30 ? hours + 1 : hours;
};

export const parkingSessionService = {
  async getRecentActivity() {
    const sessions = await parkingSessionRepository.findRecent(100);

    return sessions.map((session) => ({
      id: session.id,
      plate: session.vehicle.licensePlate,
      isGuest: session.vehicle.userId === null || session.vehicle.user?.role === "INVITADO",
      brand: session.vehicle.brand,
      model: session.vehicle.model,
      spot: session.spot.label,
      floor: session.spot.floor.name,
      entryAt: session.entryAt,
      exitAt: session.exitAt,
      status: session.status,
      amount: session.amountCharged,
    }));
  },

  async getCurrentSession(identity: { userId: number; role: string; licensePlate?: string }) {
    const session = identity.role === "INVITADO" && identity.licensePlate
      ? await parkingSessionRepository.findActiveByLicensePlate(identity.licensePlate)
      : await parkingSessionRepository.findActiveByUserId(identity.userId);

    if (!session) throw { status: 404, message: "No hay una sesión de estacionamiento activa" };

    const configs = await systemConfigService.getConfigs();
    const hourlyRate = Number.parseFloat(configs.rate_hourly || "0");
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - session.entryAt.getTime()) / 60_000));
    const billableHours = calculateBillableHours(elapsedMinutes);

    return {
      id: session.id,
      licensePlate: session.vehicle.licensePlate,
      vehicle: {
        brand: session.vehicle.brand,
        model: session.vehicle.model,
        color: session.vehicle.color,
      },
      spot: session.spot.label,
      floor: session.spot.floor.name,
      entryAt: session.entryAt,
      elapsedMinutes,
      billableHours,
      hourlyRate,
      estimatedAmount: session.amountCharged ?? billableHours * hourlyRate,
      paymentStatus: session.payment?.status ?? null,
    };
  },

  async startGuestSession(licensePlate: string, brand: string, spotId: number) {
    return prisma.$transaction(async (tx) => {
      const existingSession = await tx.parkingSession.findFirst({
        where: { status: "ACTIVE", vehicle: { licensePlate } },
      });
      if (existingSession) return existingSession;

      const existingVehicle = await tx.vehicle.findUnique({ where: { licensePlate } });
      if (existingVehicle?.userId) throw { status: 409, message: "La patente pertenece a un cliente registrado" };
      const spot = await tx.parkingSpot.findUnique({
        where: { id: spotId },
        include: { sessions: { where: { status: "ACTIVE" } } },
      });
      if (!spot) throw { status: 404, message: "El lugar no existe" };
      if (spot.assignedUserId !== null || spot.sessions.length > 0) {
        throw { status: 409, message: "El lugar seleccionado ya no está disponible" };
      }

      const vehicle = existingVehicle
        ? await tx.vehicle.update({ where: { id: existingVehicle.id }, data: { brand, model: null } })
        : await tx.vehicle.create({ data: { licensePlate, brand, model: null } });
      const session = await tx.parkingSession.create({
        data: { vehicleId: vehicle.id, spotId, status: "ACTIVE" },
      });
      await tx.parkingSpot.update({ where: { id: spotId }, data: { isOccupied: true } });
      return session;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },

  async startRegisteredSession(identity: { userId: number; role: string }, vehicleId: number, spotId: number) {
    return prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.findUnique({ where: { id: vehicleId } });
      if (!vehicle) throw { status: 404, message: "Vehículo no encontrado" };
      if (identity.role !== "ADMIN" && vehicle.userId !== identity.userId) {
        throw { status: 403, message: "El vehículo no pertenece al usuario" };
      }
      if (await tx.parkingSession.findFirst({ where: { vehicleId, status: "ACTIVE" } })) {
        throw { status: 409, message: "El vehículo ya tiene una sesión activa" };
      }
      const spot = await tx.parkingSpot.findUnique({ where: { id: spotId }, include: { sessions: { where: { status: "ACTIVE" } } } });
      if (!spot || spot.sessions.length > 0) throw { status: 409, message: "El lugar no está disponible" };
      if (spot.assignedUserId && spot.assignedUserId !== vehicle.userId) throw { status: 409, message: "El lugar está reservado" };

      if (vehicle.userId) {
        await tx.parkingSpot.updateMany({ where: { assignedUserId: vehicle.userId }, data: { assignedUserId: null } });
      }
      const session = await tx.parkingSession.create({ data: { vehicleId, spotId, status: "ACTIVE" } });
      await tx.parkingSpot.update({ where: { id: spotId }, data: { isOccupied: true, assignedUserId: vehicle.userId } });
      return session;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  },

  async finishCurrentSession(identity: { userId: number; role: string; licensePlate?: string }) {
    const active = identity.role === "INVITADO" && identity.licensePlate
      ? await parkingSessionRepository.findActiveByLicensePlate(identity.licensePlate)
      : await parkingSessionRepository.findActiveByUserId(identity.userId);
    if (!active) throw { status: 404, message: "No hay una sesión activa" };

    const configs = await systemConfigService.getConfigs();
    const totalMinutes = Math.max(0, Math.floor((Date.now() - active.entryAt.getTime()) / 60_000));
    const amount = calculateBillableHours(totalMinutes) * Number.parseFloat(configs.rate_hourly || "0");
    return prisma.$transaction(async (tx) => {
      const session = await tx.parkingSession.update({
        where: { id: active.id },
        data: { status: "COMPLETED", exitAt: new Date(), totalMinutes, amountCharged: amount },
      });
      await tx.parkingSpot.update({ where: { id: active.spotId }, data: { isOccupied: false } });
      return session;
    });
  },

  getHistory(limit = 100) {
    return parkingSessionRepository.findHistory(limit);
  },
};
