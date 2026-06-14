import { floorRepository } from "../repositories/floor.repository";

export const floorService = {
  async getFloorsOverview() {
    const floors = await floorRepository.getFloorsOverview();

    return floors.map((floor) => ({
      id: floor.id,
      name: floor.name,
      level: floor.level,
      totalSpots: floor.spots.length,
      occupiedSpots: floor.spots.filter((s) => s.isOccupied).length,
      availableSpots: floor.spots.filter((s) => !s.isOccupied).length,
      spots: floor.spots.map((spot: any) => {
        const activeSession = spot.sessions?.[0] || null;
        return {
          id: spot.id,
          label: spot.label,
          isOccupied: spot.isOccupied,
          spotType: spot.spotType,
          vehicle: activeSession ? {
            licensePlate: activeSession.vehicle.licensePlate,
            brand: activeSession.vehicle.brand,
            model: activeSession.vehicle.model,
            color: activeSession.vehicle.color,
            entryAt: activeSession.entryAt,
          } : null,
        };
      }),
    }));
  },

  async getFloorsOverviewForUser(userId: number, role: string, userPlate?: string) {
    const floors = await floorRepository.getFloorsOverview();

    return floors.map((floor) => ({
      id: floor.id,
      name: floor.name,
      level: floor.level,
      totalSpots: floor.spots.length,
      occupiedSpots: floor.spots.filter((s) => s.isOccupied).length,
      availableSpots: floor.spots.filter((s) => !s.isOccupied).length,
      spots: floor.spots.map((spot: any) => {
        const activeSession = spot.sessions?.[0] || null;
        
        const isOwnVehicle = activeSession ? (
          (activeSession.vehicle.userId !== null && activeSession.vehicle.userId === userId) ||
          (!!userPlate && activeSession.vehicle.licensePlate.toLowerCase() === userPlate.toLowerCase())
        ) : false;

        return {
          id: spot.id,
          label: spot.label,
          isOccupied: spot.isOccupied,
          spotType: spot.spotType,
          isOwnVehicle,
          vehicle: activeSession && isOwnVehicle ? {
            licensePlate: activeSession.vehicle.licensePlate,
            brand: activeSession.vehicle.brand,
            model: activeSession.vehicle.model,
            color: activeSession.vehicle.color,
            entryAt: activeSession.entryAt,
          } : null,
        };
      }),
    }));
  },
};
