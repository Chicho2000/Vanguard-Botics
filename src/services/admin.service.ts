import { adminRepository } from "../repositories/admin.repository";

export const adminService = {
  async getDashboardStats() {
    const [totalUsers, totalVehicles, totalSpots, occupiedSpots, activeSessions, todayRevenue] =
      await Promise.all([
        adminRepository.countUsers(),
        adminRepository.countVehicles(),
        adminRepository.countTotalSpots(),
        adminRepository.countOccupiedSpots(),
        adminRepository.countActiveSessions(),
        adminRepository.getTodayRevenue(),
      ]);

    const availableSpots = totalSpots - occupiedSpots;
    const occupancyRate = totalSpots > 0 ? Math.round((occupiedSpots / totalSpots) * 100) : 0;

    return {
      totalUsers,
      totalVehicles,
      totalSpots,
      occupiedSpots,
      availableSpots,
      activeSessions,
      occupancyRate,
      todayRevenue,
    };
  },

  async getRecentActivity() {
    const sessions = await adminRepository.getRecentSessions(10);

    return sessions.map((session) => ({
      id: session.id,
      plate: session.vehicle.licensePlate,
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

  async getFloorsOverview() {
    const floors = await adminRepository.getFloors();

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
    const floors = await adminRepository.getFloors();

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
