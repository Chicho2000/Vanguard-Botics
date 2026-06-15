import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedAdminPassword = await bcrypt.hash("admin1234", 10);
  const hashedPassword = await bcrypt.hash("cliente1234", 10);

  // Clean slate for floors, spots, vehicles, sessions, and payments
  await prisma.payment.deleteMany({});
  await prisma.parkingSession.deleteMany({});
  await prisma.parkingSpot.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.subscription.deleteMany({});
  await prisma.vehicle.deleteMany({});
  await prisma.user.deleteMany({});
  console.log("🧹 Base de datos limpiada");

  // Re-upsert Admin User
  const admin = await prisma.user.create({
    data: {
      email: "admin@chumi.com",
      password: hashedAdminPassword,
      name: "Admin Vanguard",
      role: "ADMIN",
    },
  });
  console.log("✅ Usuario administrador creado");

  // Create Client Users
  const user1 = await prisma.user.create({
    data: {
      email: "cliente1@chumi.com",
      password: hashedPassword,
      name: "Juan Pérez",
      role: "CLIENTE",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "cliente2@chumi.com",
      password: hashedPassword,
      name: "Sofía Rodríguez",
      role: "CLIENTE",
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "cliente3@chumi.com",
      password: hashedPassword,
      name: "Martín Gómez",
      role: "CLIENTE",
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: "cliente4@chumi.com",
      password: hashedPassword,
      name: "Lucía Fernández",
      role: "CLIENTE",
    },
  });
  console.log("✅ Usuarios clientes creados");

  // Create Subscriptions and Payments
  const now = new Date();
  
  const oneDayLater = new Date(now);
  oneDayLater.setDate(now.getDate() + 1);

  const oneMonthLater = new Date(now);
  oneMonthLater.setMonth(now.getMonth() + 1);

  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(now.getFullYear() + 1);

  const oneMonthAgo = new Date(now);
  oneMonthAgo.setMonth(now.getMonth() - 1);
  const oneDayAgo = new Date(now);
  oneDayAgo.setDate(now.getDate() - 1);

  // Sub 1: Juan - Active MONTHLY
  const sub1 = await prisma.subscription.create({
    data: {
      userId: user1.id,
      type: "MONTHLY",
      validFrom: now,
      validUntil: oneMonthLater,
      status: "ACTIVE",
    },
  });
  await prisma.payment.create({
    data: {
      subscriptionId: sub1.id,
      amount: 25000,
      status: "APPROVED",
      paidAt: now,
    },
  });

  // Sub 2: Sofía - Active DAILY
  const sub2 = await prisma.subscription.create({
    data: {
      userId: user2.id,
      type: "DAILY",
      validFrom: now,
      validUntil: oneDayLater,
      status: "ACTIVE",
    },
  });
  await prisma.payment.create({
    data: {
      subscriptionId: sub2.id,
      amount: 3000,
      status: "APPROVED",
      paidAt: now,
    },
  });

  // Sub 3: Martín - Active YEARLY
  const sub3 = await prisma.subscription.create({
    data: {
      userId: user3.id,
      type: "YEARLY",
      validFrom: now,
      validUntil: oneYearLater,
      status: "ACTIVE",
    },
  });
  await prisma.payment.create({
    data: {
      subscriptionId: sub3.id,
      amount: 180000,
      status: "APPROVED",
      paidAt: now,
    },
  });

  // Sub 4: Lucía - Expired (EXPIRED)
  await prisma.subscription.create({
    data: {
      userId: user4.id,
      type: "DAILY",
      validFrom: oneMonthAgo,
      validUntil: oneDayAgo,
      status: "EXPIRED",
    },
  });
  console.log("✅ Suscripciones y pagos creados");

  // Create Vehicles and link them
  const v1 = await prisma.vehicle.create({
    data: { licensePlate: "AA123BB", userId: user1.id, brand: "Toyota", model: "Corolla", color: "Gris" },
  });
  const v2 = await prisma.vehicle.create({
    data: { licensePlate: "CC987DD", userId: user2.id, brand: "Honda", model: "Civic", color: "Negro" },
  });
  const v3 = await prisma.vehicle.create({
    data: { licensePlate: "EE456FF", userId: user3.id, brand: "Fiat", model: "Cronos", color: "Blanco" },
  });
  const v4 = await prisma.vehicle.create({
    data: { licensePlate: "GG789HH", userId: user4.id, brand: "Volkswagen", model: "Gol", color: "Rojo" },
  });
  const vGuest = await prisma.vehicle.create({
    data: { licensePlate: "II111JJ", userId: null, brand: "Ford", model: "Focus", color: "Azul" },
  });
  console.log("✅ Vehículos creados y asociados");

  // Create Floors
  const pb = await prisma.floor.create({
    data: {
      name: "Planta Baja",
      level: 0,
      maxHeightCm: 240,
      maxWeightKg: 3500,
      maxWidthCm: 220,
    },
  });

  const p1 = await prisma.floor.create({
    data: {
      name: "Primer Piso",
      level: 1,
      maxHeightCm: 220,
      maxWeightKg: 2500,
      maxWidthCm: 210,
    },
  });
  console.log("✅ Pisos creados");

  // Create Spots (12 on PB and 12 on Floor 1, each floor has 2 rows of 6 spots)
  const spotsData: any[] = [];
  
  // Planta Baja: A1 to A12
  for (let i = 1; i <= 12; i++) {
    const row = i <= 6 ? 1 : 2;
    const col = i <= 6 ? i : i - 6;
    spotsData.push({
      label: `A${i}`,
      row,
      column: col,
      floorId: pb.id,
      isOccupied: false,
      spotType: i === 3 ? "DISABLED" : i === 5 ? "EV_CHARGING" : "NORMAL",
    });
  }

  // Primer Piso: B1 to B12
  for (let i = 1; i <= 12; i++) {
    const row = i <= 6 ? 1 : 2;
    const col = i <= 6 ? i : i - 6;
    spotsData.push({
      label: `B${i}`,
      row,
      column: col,
      floorId: p1.id,
      isOccupied: false,
      spotType: i === 4 ? "MOTORCYCLE" : "NORMAL",
    });
  }

  const createdSpots: any[] = [];
  for (const s of spotsData) {
    const spot = await prisma.parkingSpot.create({
      data: {
        label: s.label,
        row: s.row,
        column: s.column,
        floorId: s.floorId,
        isOccupied: s.isOccupied,
        spotType: s.spotType,
        maxWidthCm: 200,
      },
    });
    createdSpots.push(spot);
  }
  console.log("✅ Cocheras creadas (12 PB, 12 Primer Piso)");

  // Create active sessions:
  // 1. Juan's Corolla AA123BB (Subscribed MONTHLY) parked at A1
  const spotA1 = createdSpots.find(s => s.label === "A1");
  await prisma.parkingSession.create({
    data: {
      spotId: spotA1.id,
      vehicleId: v1.id,
      entryAt: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
      status: "ACTIVE",
    },
  });
  await prisma.parkingSpot.update({
    where: { id: spotA1.id },
    data: { isOccupied: true },
  });

  // 2. Sofía's Civic CC987DD (Subscribed DAILY) parked at A3
  const spotA3 = createdSpots.find(s => s.label === "A3");
  await prisma.parkingSession.create({
    data: {
      spotId: spotA3.id,
      vehicleId: v2.id,
      entryAt: new Date(now.getTime() - 45 * 60 * 1000), // 45 mins ago
      status: "ACTIVE",
    },
  });
  await prisma.parkingSpot.update({
    where: { id: spotA3.id },
    data: { isOccupied: true },
  });

  // 3. Lucía's Gol GG789HH (Expired) parked at A5
  // Note: Since subscription is expired, this vehicle is not within active subscription.
  const spotA5 = createdSpots.find(s => s.label === "A5");
  await prisma.parkingSession.create({
    data: {
      spotId: spotA5.id,
      vehicleId: v4.id,
      entryAt: new Date(now.getTime() - 3 * 60 * 60 * 1000), // 3 hours ago
      status: "ACTIVE",
    },
  });
  await prisma.parkingSpot.update({
    where: { id: spotA5.id },
    data: { isOccupied: true },
  });

  // 4. Guest Focus II111JJ (No subscription) parked at B2
  const spotB2 = createdSpots.find(s => s.label === "B2");
  await prisma.parkingSession.create({
    data: {
      spotId: spotB2.id,
      vehicleId: vGuest.id,
      entryAt: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      status: "ACTIVE",
    },
  });
  await prisma.parkingSpot.update({
    where: { id: spotB2.id },
    data: { isOccupied: true },
  });

  console.log("✅ Sesiones de telemetría activa inicializadas");
  console.log("🚀 Base de datos inicializada por completo!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
