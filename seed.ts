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
  const hashedPassword = await bcrypt.hash("admin1234", 10);

  // Re-upsert Admin User
  const user = await prisma.user.upsert({
    where: { email: "admin@chumi.com" },
    update: {},
    create: {
      email: "admin@chumi.com",
      password: hashedPassword,
      name: "Admin Vanguard",
      role: "ADMIN",
    },
  });
  console.log("✅ Usuario administrador verificado");

  // Clean slate for floors, spots, vehicles, sessions, and payments
  await prisma.payment.deleteMany({});
  await prisma.parkingSession.deleteMany({});
  await prisma.parkingSpot.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.vehicle.deleteMany({});
  console.log("🧹 Base de datos limpiada");

  // 1. Create Floors
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

  // 2. Create Spots for PB (A1 to A6) and Floor 1 (B1 to B6)
  const spotsData = [
    { label: "A1", row: 1, column: 1, floorId: pb.id, isOccupied: true, spotType: "NORMAL" },
    { label: "A2", row: 1, column: 2, floorId: pb.id, isOccupied: false, spotType: "NORMAL" },
    { label: "A3", row: 1, column: 3, floorId: pb.id, isOccupied: true, spotType: "DISABLED" },
    { label: "A4", row: 1, column: 4, floorId: pb.id, isOccupied: false, spotType: "EV_CHARGING" },
    { label: "A5", row: 1, column: 5, floorId: pb.id, isOccupied: true, spotType: "NORMAL" },
    { label: "A6", row: 1, column: 6, floorId: pb.id, isOccupied: false, spotType: "NORMAL" },
    
    { label: "B1", row: 1, column: 1, floorId: p1.id, isOccupied: false, spotType: "NORMAL" },
    { label: "B2", row: 1, column: 2, floorId: p1.id, isOccupied: true, spotType: "NORMAL" },
    { label: "B3", row: 1, column: 3, floorId: p1.id, isOccupied: false, spotType: "MOTORCYCLE" },
    { label: "B4", row: 1, column: 4, floorId: p1.id, isOccupied: false, spotType: "NORMAL" },
    { label: "B5", row: 1, column: 5, floorId: p1.id, isOccupied: true, spotType: "NORMAL" },
    { label: "B6", row: 1, column: 6, floorId: p1.id, isOccupied: false, spotType: "NORMAL" },
  ];

  const createdSpots: any[] = [];
  for (const s of spotsData) {
    const spot = await prisma.parkingSpot.create({
      data: {
        label: s.label,
        row: s.row,
        column: s.column,
        floorId: s.floorId,
        isOccupied: s.isOccupied,
        spotType: s.spotType as any,
        maxWidthCm: 200,
      },
    });
    createdSpots.push(spot);
  }
  console.log("✅ Cocheras creadas");

  // 3. Create Vehicles
  const vehiclesData = [
    { licensePlate: "AA123BB", brand: "Toyota", model: "Corolla", color: "Gris" },
    { licensePlate: "CC987DD", brand: "Honda", model: "Civic", color: "Negro" },
    { licensePlate: "EE456FF", brand: "Fiat", model: "Cronos", color: "Blanco" },
    { licensePlate: "GG789HH", brand: "Volkswagen", model: "Gol", color: "Rojo" },
    { licensePlate: "II111JJ", brand: "Ford", model: "Focus", color: "Azul" },
  ];

  const createdVehicles: any[] = [];
  for (const v of vehiclesData) {
    const vehicle = await prisma.vehicle.create({
      data: {
        licensePlate: v.licensePlate,
        brand: v.brand,
        model: v.model,
        color: v.color,
      },
    });
    createdVehicles.push(vehicle);
  }
  console.log("✅ Vehículos de prueba creados");

  // 4. Associate Active Sessions to Occupied Spots (A1, A3, A5, B2, B5)
  const occupiedSpots = createdSpots.filter(s => s.isOccupied);
  for (let i = 0; i < occupiedSpots.length; i++) {
    const spot = occupiedSpots[i];
    const vehicle = createdVehicles[i % createdVehicles.length];
    
    // Calculate randomized entry time (between 1 and 5 hours ago)
    const entryTime = new Date();
    entryTime.setHours(entryTime.getHours() - (i + 1));

    await prisma.parkingSession.create({
      data: {
        spotId: spot.id,
        vehicleId: vehicle.id,
        entryAt: entryTime,
        status: "ACTIVE",
      },
    });
  }
  console.log("✅ Sesiones de telemetría activa inicializadas");
  console.log("🚀 Base de datos inicializada por completo!");
}

main()
  .catch(console.error)
  .finally(() => pool.end());
