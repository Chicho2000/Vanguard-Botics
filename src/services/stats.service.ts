import { userRepository } from "../repositories/user.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { parkingSpotRepository } from "../repositories/parking-spot.repository";
import { parkingSessionRepository } from "../repositories/parking-session.repository";
import { paymentRepository } from "../repositories/payment.repository";

export const statsService = {
  async getDashboardStats() {
    const [
      totalUsers,
      totalVehicles,
      totalSpots,
      occupiedSpots,
      activeSessions,
      todayRevenue,
    ] = await Promise.all([
      userRepository.count(),
      vehicleRepository.count(),
      parkingSpotRepository.count(),
      parkingSpotRepository.countOccupied(),
      parkingSessionRepository.countActive(),
      paymentRepository.getTodayRevenue(),
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
};
