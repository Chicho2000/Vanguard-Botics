import { floorRepository } from "../repositories/floor.repository";
import { prisma } from "../lib/prisma";

export const floorService = {
  async getFloorsOverview() {
    const floors = await floorRepository.getFloorsOverview();

    // 1. Fetch all active subscriptions where user does NOT have an assigned spot
    const now = new Date();
    const activeSubs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        validUntil: { gte: now },
        user: {
          assignedSpot: { is: null },
        }
      },
      select: {
        userId: true,
      },
    });

    const activeSubUserIds = new Set(activeSubs.map((s) => s.userId));

    // 2. Scan all floors to find which subscribed users are parked
    const parkedSubscribedUserIds = new Set<number>();

    const floorsMappedPre = floors.map((floor) => {
      return {
        ...floor,
        spots: floor.spots.map((spot: any) => {
          const activeSession = spot.sessions?.[0] || null;
          const vehicle = activeSession?.vehicle || null;
          const isSubscribed = vehicle?.userId ? activeSubUserIds.has(vehicle.userId) : false;

          if (isSubscribed && vehicle?.userId) {
            parkedSubscribedUserIds.add(vehicle.userId);
          }

          return {
            id: spot.id,
            label: spot.label,
            spotType: spot.spotType,
            row: spot.row,
            column: spot.column,
            activeSession,
            isSubscribed,
            assignedUserId: spot.assignedUserId,
          };
        }),
      };
    });

    // 3. Calculate unparked active subscriptions and fetch vehicles
    const unparkedUserIds = Array.from(activeSubUserIds).filter((uid) => !parkedSubscribedUserIds.has(uid));
    const unparkedVehicles = await prisma.vehicle.findMany({
      where: { userId: { in: unparkedUserIds } }
    });
    const vehicleQueue = [...unparkedVehicles];

    // Fetch vehicles of users who have assigned spots
    const assignedUserIds = Array.from(new Set(
      floors.flatMap(f => f.spots.map(s => s.assignedUserId).filter(Boolean) as number[])
    ));
    const assignedVehicles = await prisma.vehicle.findMany({
      where: { userId: { in: assignedUserIds } }
    });
    const assignedVehicleMap = new Map<number, any>();
    for (const v of assignedVehicles) {
      assignedVehicleMap.set(v.userId!, v);
    }

    // 4. Final mapping: distribute reserved status to empty spots
    return floorsMappedPre.map((floor) => {
      const mappedSpots = floor.spots.map((spot) => {
        const isOccupied = !!spot.activeSession;
        const isAssigned = spot.assignedUserId !== null;

        let isReserved = isAssigned;
        let status: "OCCUPIED" | "RESERVED" | "EMPTY" = "EMPTY";
        let assignedVehicle: any = null;

        if (isOccupied) {
          status = "OCCUPIED";
        } else if (isAssigned) {
          isReserved = true;
          status = "RESERVED";
          assignedVehicle = spot.assignedUserId ? assignedVehicleMap.get(spot.assignedUserId) : null;
        } else if (vehicleQueue.length > 0) {
          isReserved = true;
          status = "RESERVED";
          assignedVehicle = vehicleQueue.shift();
        }

        return {
          id: spot.id,
          label: spot.label,
          isOccupied: isOccupied,
          isReserved: isReserved,
          status,
          spotType: spot.spotType,
          row: spot.row,
          column: spot.column,
          vehicle: isOccupied && spot.activeSession ? {
            licensePlate: spot.activeSession.vehicle.licensePlate,
            brand: spot.activeSession.vehicle.brand,
            model: spot.activeSession.vehicle.model,
            color: spot.activeSession.vehicle.color,
            entryAt: spot.activeSession.entryAt,
          } : (isReserved && assignedVehicle) ? {
            licensePlate: assignedVehicle.licensePlate,
            brand: assignedVehicle.brand,
            model: assignedVehicle.model,
            color: assignedVehicle.color,
            entryAt: null,
          } : null,
        };
      });

      return {
        id: floor.id,
        name: floor.name,
        level: floor.level,
        totalSpots: mappedSpots.length,
        occupiedSpots: mappedSpots.filter((s) => s.isOccupied).length,
        availableSpots: mappedSpots.filter((s) => s.status === "EMPTY").length,
        spots: mappedSpots,
      };
    });
  },

  async getFloorsOverviewForUser(userId: number, role: string, userPlate?: string) {
    const floors = await floorRepository.getFloorsOverview();

    // 1. Fetch all active subscriptions where user does NOT have an assigned spot
    const now = new Date();
    const activeSubs = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        validUntil: { gte: now },
        user: {
          assignedSpot: { is: null },
        },
      },
      select: {
        userId: true,
      },
    });

    const activeSubUserIds = new Set(activeSubs.map((s) => s.userId));

    // 2. Scan to see who is parked
    const parkedSubscribedUserIds = new Set<number>();

    const floorsMappedPre = floors.map((floor) => {
      return {
        ...floor,
        spots: floor.spots.map((spot: any) => {
          const activeSession = spot.sessions?.[0] || null;
          const vehicle = activeSession?.vehicle || null;
          const isSubscribed = vehicle?.userId ? activeSubUserIds.has(vehicle.userId) : false;

          const isOwnVehicle = activeSession ? (
            (activeSession.vehicle.userId !== null && activeSession.vehicle.userId === userId) ||
            (!!userPlate && activeSession.vehicle.licensePlate.toLowerCase() === userPlate.toLowerCase())
          ) : false;

          if (isSubscribed && vehicle?.userId) {
            parkedSubscribedUserIds.add(vehicle.userId);
          }

          return {
            id: spot.id,
            label: spot.label,
            spotType: spot.spotType,
            row: spot.row,
            column: spot.column,
            activeSession,
            isSubscribed,
            isOwnVehicle,
            assignedUserId: spot.assignedUserId,
          };
        }),
      };
    });

    // 3. Calculate unparked active subscriptions and fetch vehicles
    const unparkedUserIds = Array.from(activeSubUserIds).filter((uid) => !parkedSubscribedUserIds.has(uid));
    const unparkedVehicles = await prisma.vehicle.findMany({
      where: { userId: { in: unparkedUserIds } }
    });
    const vehicleQueue = [...unparkedVehicles];

    // Fetch assigned vehicles map for assigned spots
    const assignedUserIds = Array.from(new Set(
      floors.flatMap(f => f.spots.map(s => s.assignedUserId).filter(Boolean) as number[])
    ));
    const assignedVehicles = await prisma.vehicle.findMany({
      where: { userId: { in: assignedUserIds } }
    });
    const assignedVehicleMap = new Map<number, any>();
    for (const v of assignedVehicles) {
      assignedVehicleMap.set(v.userId!, v);
    }

    // 4. Final mapping: distribute reserved status to empty spots
    return floorsMappedPre.map((floor) => {
      const mappedSpots = floor.spots.map((spot) => {
        const isOccupied = !!spot.activeSession;
        const isOwnSpot = spot.assignedUserId === userId;
        const isAssignedToOther = spot.assignedUserId !== null && !isOwnSpot;

        let isReserved = isOwnSpot || isAssignedToOther;
        let status: "OCCUPIED" | "RESERVED" | "EMPTY" = "EMPTY";
        let assignedVehicle: any = null;

        if (isOccupied) {
          status = "OCCUPIED";
        } else if (isOwnSpot) {
          isReserved = true;
          status = "RESERVED";
          assignedVehicle = assignedVehicleMap.get(userId) || null;
        } else if (isAssignedToOther) {
          isReserved = true;
          status = "RESERVED";
          assignedVehicle = spot.assignedUserId ? assignedVehicleMap.get(spot.assignedUserId) : null;
        } else if (vehicleQueue.length > 0) {
          isReserved = true;
          status = "RESERVED";
          assignedVehicle = vehicleQueue.shift();
        }

        const returnVehicleDetails = spot.activeSession
          ? spot.isOwnVehicle
          : (isOwnSpot && assignedVehicle)
            ? true
            : false;

        return {
          id: spot.id,
          label: spot.label,
          isOccupied: isOccupied,
          isReserved: isReserved,
          isOwnSpot: isOwnSpot,
          status,
          spotType: spot.spotType,
          row: spot.row,
          column: spot.column,
          isOwnVehicle: spot.isOwnVehicle || (isOwnSpot && !!spot.activeSession && spot.activeSession.vehicle.userId === userId),
          vehicle: returnVehicleDetails && spot.activeSession ? {
            licensePlate: spot.activeSession.vehicle.licensePlate,
            brand: spot.activeSession.vehicle.brand,
            model: spot.activeSession.vehicle.model,
            color: spot.activeSession.vehicle.color,
            entryAt: spot.activeSession.entryAt,
          } : (isOwnSpot && assignedVehicle) ? {
            licensePlate: assignedVehicle.licensePlate,
            brand: assignedVehicle.brand,
            model: assignedVehicle.model,
            color: assignedVehicle.color,
            entryAt: null,
          } : null,
        };
      });

      return {
        id: floor.id,
        name: floor.name,
        level: floor.level,
        totalSpots: mappedSpots.length,
        occupiedSpots: mappedSpots.filter((s) => s.isOccupied).length,
        availableSpots: mappedSpots.filter((s) => s.status === "EMPTY").length,
        spots: mappedSpots,
      };
    });
  },
};
