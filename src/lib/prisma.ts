// Prisma client singleton — sin adapter para compatibilidad con el servidor
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

console.log("Prisma Client inicializado. DATABASE_URL:", process.env.DATABASE_URL ? "SÍ" : "NO");

export const prisma = new PrismaClient();


