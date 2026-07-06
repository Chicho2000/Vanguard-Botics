import { prisma } from "../src/lib/prisma";

async function main() {
  const spot = await prisma.parkingSpot.findFirst({
    where: { label: { equals: "B2", mode: "insensitive" } },
    include: {
      sessions: {
        where: { status: "ACTIVE", vehicle: { userId: null } },
        include: { vehicle: true },
      },
    },
  });

  if (!spot || spot.sessions.length === 0) {
    console.log("B2 no tiene un invitado huérfano activo.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const session of spot.sessions) {
      await tx.payment.deleteMany({ where: { sessionId: session.id } });
      await tx.parkingSession.delete({ where: { id: session.id } });
      const remainingSessions = await tx.parkingSession.count({ where: { vehicleId: session.vehicleId } });
      if (remainingSessions === 0) await tx.vehicle.delete({ where: { id: session.vehicleId } });
    }
    const remainingActive = await tx.parkingSession.count({ where: { spotId: spot.id, status: "ACTIVE" } });
    await tx.parkingSpot.update({ where: { id: spot.id }, data: { isOccupied: remainingActive > 0 } });
  });

  console.log(`Se eliminó el invitado huérfano de B2 (${spot.sessions.map((session) => session.vehicle.licensePlate).join(", ")}).`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
