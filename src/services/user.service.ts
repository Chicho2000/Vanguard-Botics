import { userRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";

export const userService = {
  async getUsers() {
    return await userRepository.findMany();
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    if (!user) return null;
    
    // Remove password before returning
    const { password, ...safeUser } = user;
    return safeUser;
  },

  async createUser(data: any) {
    const { email, password, name, phone, role } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await userRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      role: role || "CLIENTE",
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async updateUser(id: number, data: any) {
    const { email, name, phone, role } = data;
    const user = await userRepository.update(id, {
      email,
      name,
      phone,
      role,
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async patchUser(id: number, data: any) {
    const updateData: Prisma.UserUpdateInput = { ...data };
    if (updateData.password && typeof updateData.password === "string") {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await userRepository.update(id, updateData);
    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async deleteUser(id: number): Promise<void> {
    await userRepository.delete(id);
  },
};
