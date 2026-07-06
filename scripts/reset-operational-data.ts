import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function resetOperationalData() {
  const result = await prisma.$transaction(async (tx) => {
    const payments = await tx.payment.deleteMany();
    const sessions = await tx.parkingSession.deleteMany();
    const subscriptions = await tx.subscription.deleteMany();
    const vehicles = await tx.vehicle.deleteMany();
    await tx.parkingSpot.updateMany({ data: { assignedUserId: null, isOccupied: false } });
    const users = await tx.user.deleteMany({ where: { role: { not: "ADMIN" } } });
    return {
      deletedUsers: users.count,
      deletedVehicles: vehicles.count,
      deletedSessions: sessions.count,
      deletedSubscriptions: subscriptions.count,
      deletedPayments: payments.count,
    };
  });
  console.log(JSON.stringify(result));
}

resetOperationalData()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
