import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

console.log("Prisma Client inicializado. DATABASE_URL:", process.env.DATABASE_URL ? "SÍ" : "NO");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({ adapter });

