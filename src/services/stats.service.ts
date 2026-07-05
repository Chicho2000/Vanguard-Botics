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

    // 1. Fetch recent users (last 5) with vehicles, active subscription, and assigned spot
    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        vehicles: true,
        subscriptions: {
          where: { status: "ACTIVE", validUntil: { gte: now } },
          orderBy: { validUntil: "desc" },
          take: 1,
        },
        assignedSpot: true,
      },
    });

    const mappedRecentUsers = recentUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      createdAt: u.createdAt,
      vehicles: u.vehicles.map((v) => ({
        licensePlate: v.licensePlate,
        brand: v.brand,
        model: v.model,
      })),
      subscription: u.subscriptions[0]
        ? { type: u.subscriptions[0].type, validUntil: u.subscriptions[0].validUntil }
        : null,
      assignedSpot: u.assignedSpot ? u.assignedSpot.label : null,
    }));

    // 2. Fetch active reservations (spots pre-assigned to users)
    const activeReservations = await prisma.parkingSpot.findMany({
      where: {
        assignedUserId: { not: null },
      },
      include: {
        assignedUser: {
          include: {
            vehicles: {
              take: 1,
            },
            subscriptions: {
              where: { status: "ACTIVE", validUntil: { gte: now } },
              take: 1,
            },
          },
        },
        floor: true,
      },
    });

    const mappedActiveReservations = activeReservations.map((s) => ({
      spotId: s.id,
      label: s.label,
      floorName: s.floor.name,
      userId: s.assignedUser?.id,
      userName: s.assignedUser?.name,
      userEmail: s.assignedUser?.email,
      licensePlate: s.assignedUser?.vehicles[0]?.licensePlate || null,
      subscriptionType: s.assignedUser?.subscriptions[0]?.type || null,
      subscriptionValidUntil: s.assignedUser?.subscriptions[0]?.validUntil || null,
    }));

    // 3. Generate hourly chart data for today (intervals of 2 hours)
    const chartData: { time: string; ocupacion: number; recaudacion: number }[] = [];
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const intervals = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24];

    const sessionsToday = await prisma.parkingSession.findMany({
      where: {
        OR: [
          {
            entryAt: { lte: endOfToday },
            exitAt: { gte: startOfToday },
          },
          {
            entryAt: { lte: endOfToday },
            exitAt: null,
          },
        ],
      },
    });

    const paymentsToday = await prisma.payment.findMany({
      where: {
        status: "APPROVED",
        paidAt: {
          gte: startOfToday,
          lte: endOfToday,
        },
      },
    });

    for (const h of intervals) {
      const timeLabel = `${String(h).padStart(2, "0")}:00`;
      const intervalTime = new Date(startOfToday);
      intervalTime.setHours(h, 0, 0, 0);

      // Calculate occupancy at this hour
      let occupiedCount = 0;
      for (const session of sessionsToday) {
        const entry = new Date(session.entryAt);
        const exit = session.exitAt ? new Date(session.exitAt) : null;
        if (entry <= intervalTime && (exit === null || exit >= intervalTime)) {
          occupiedCount++;
        }
      }
      const occupancyPct = totalSpots > 0 ? Math.round((occupiedCount / totalSpots) * 100) : 0;

      // Calculate cumulative revenue up to this hour
      let accumulatedRevenue = 0;
      for (const payment of paymentsToday) {
        if (payment.paidAt && new Date(payment.paidAt) <= intervalTime) {
          accumulatedRevenue += payment.amount;
        }
      }

      chartData.push({
        time: timeLabel,
        ocupacion: occupancyPct,
        recaudacion: accumulatedRevenue,
      });
    }

    return {
      totalSpots,
      occupancyRate,
      totalUsers,
      todayRevenue,
      recentUsers: mappedRecentUsers,
      activeReservations: mappedActiveReservations,
      chartData,
    };
  },
};
