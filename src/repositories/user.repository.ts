import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";

export const userRepository = {
  async count(): Promise<number> {
    return await prisma.user.count();
  },

  async findByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: number) {
    return await prisma.user.findUnique({
      where: { id },
    });
  },

  async findMany() {
    return await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });
  },

  async create(data: Prisma.UserCreateInput) {
    return await prisma.user.create({
      data,
    });
  },

  async update(id: number, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  },
};
