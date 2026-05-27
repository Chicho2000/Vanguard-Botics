import { prisma } from "../lib/prisma";

export const authRepository = {
  async findUserByEmail(email: string) {
    return await prisma.user.findUnique({ where: { email } });
  },

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    phone?: string | null;
    role?: string;
  }) {
    return await prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone ?? null,
        role: (data.role as any) ?? "CLIENTE",
      },
    });
  },
};
