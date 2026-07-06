import { floorRepository } from "../repositories/floor.repository";
import { prisma } from "../lib/prisma";

const mapFloors = async (viewer?: { userId: number; plate?: string }) => {
  const floors = await floorRepository.getFloorsOverview();
  const assignedUserIds = [...new Set(floors.flatMap((floor) =>
    floor.spots.map((spot) => spot.assignedUserId).filter((id): id is number => id !== null),
  ))];
  const assignedVehicles = await prisma.vehicle.findMany({ where: { userId: { in: assignedUserIds } } });
  const vehicleByUser = new Map(assignedVehicles.map((vehicle) => [vehicle.userId, vehicle]));

  return floors.map((floor) => {
    const spots = floor.spots.map((spot) => {
      const activeSession = spot.sessions[0] ?? null;
      const occupied = Boolean(activeSession);
      const ownVehicle = Boolean(activeSession && viewer && (
        activeSession.vehicle.userId === viewer.userId || activeSession.vehicle.licensePlate === viewer.plate
      ));
      const ownSpot = Boolean(viewer && spot.assignedUserId === viewer.userId);
      const isGuest = Boolean(activeSession && (
        activeSession.vehicle.userId === null || activeSession.vehicle.user?.role === "INVITADO"
      ));
      const status: "OCCUPIED" | "RESERVED" | "EMPTY" = occupied
        ? "OCCUPIED"
        : spot.assignedUserId !== null ? "RESERVED" : "EMPTY";
      const assignedVehicle = spot.assignedUserId ? vehicleByUser.get(spot.assignedUserId) : null;
      const maySeeVehicle = !viewer || ownVehicle || ownSpot;
      const vehicle = activeSession?.vehicle ?? assignedVehicle ?? null;

      return {
        id: spot.id,
        label: spot.label,
        isOccupied: occupied,
        isReserved: status === "RESERVED",
        isOwnSpot: ownSpot,
        isOwnVehicle: ownVehicle,
        isGuest,
        status,
        spotType: spot.spotType,
        maxWidthCm: spot.maxWidthCm,
        row: spot.row,
        column: spot.column,
        assignedUserId: spot.assignedUserId,
        activeSessionId: activeSession?.id ?? null,
        vehicle: maySeeVehicle && vehicle ? {
          licensePlate: vehicle.licensePlate,
          brand: vehicle.brand,
          model: null,
          color: vehicle.color,
          entryAt: activeSession?.entryAt ?? null,
        } : null,
      };
    });

    return {
      id: floor.id,
      name: floor.name,
      level: floor.level,
      totalSpots: spots.length,
      occupiedSpots: spots.filter((spot) => spot.isOccupied).length,
      availableSpots: spots.filter((spot) => spot.status === "EMPTY").length,
      spots,
    };
  });
};

export const floorService = {
  getFloorsOverview: () => mapFloors(),
  getFloorsOverviewForUser: (userId: number, _role: string, plate?: string) => mapFloors({ userId, plate }),
};
