import { userRepository } from "../repositories/user.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { parkingSpotRepository } from "../repositories/parking-spot.repository";
import { parkingSessionRepository } from "../repositories/parking-session.repository";
import { paymentRepository } from "../repositories/payment.repository";
import { prisma } from "../lib/prisma";

export const statsService = {
  async getDashboardStats() {
    const now = new Date();

    const [
      totalUsers,
      totalVehicles,
      totalSpots,
      occupiedSpots,
      todayRevenue,
    ] = await Promise.all([
      userRepository.count(),
      vehicleRepository.count(),
      parkingSpotRepository.count(),
      // Dynamic occupied spots: only count active sessions of subscribed vehicles
      prisma.parkingSession.count({
        where: {
          status: "ACTIVE",
          vehicle: {
            user: {
              subscriptions: {
                some: {
                  status: "ACTIVE",
                  validUntil: { gte: now },
                },
              },
            },
          },
        },
      }),
      paymentRepository.getTodayRevenue(),
    ]);

    const activeSessions = occupiedSpots;
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
