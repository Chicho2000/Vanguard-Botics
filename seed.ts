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

  console.log("✅ Usuario creado:", user.email, "| Rol:", user.role);
}

main()
  .catch(console.error)
  .finally(() => pool.end());
