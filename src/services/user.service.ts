import { userRepository } from "../repositories/user.repository";
import bcrypt from "bcrypt";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

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
    const { email, password, name, phone, role, patente, brand, model, color } = data;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await userRepository.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      phone,
      role: role || "CLIENTE",
    });

    if (patente) {
      const formattedPatente = patente.toUpperCase().trim();
      const existingVehicle = await prisma.vehicle.findUnique({ where: { licensePlate: formattedPatente } });
      
      if (existingVehicle) {
        await prisma.vehicle.update({
          where: { id: existingVehicle.id },
          data: {
            userId: user.id,
            brand: brand || existingVehicle.brand,
            model: model || existingVehicle.model,
            color: color || existingVehicle.color
          }
        });
      } else {
        await prisma.vehicle.create({
          data: {
            licensePlate: formattedPatente,
            userId: user.id,
            brand: brand || "Desconocido",
            model: model || "Desconocido",
            color: color || "Desconocido"
          }
        });
      }

      // Automatically assign daily subscription and payment so they have a reserved space
      const now = new Date();
      const subscriptionUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const sub = await prisma.subscription.create({
        data: {
          userId: user.id,
          type: "DAILY",
          validFrom: now,
          validUntil: subscriptionUntil,
          status: "ACTIVE",
        },
      });

      await prisma.payment.create({
        data: {
          subscriptionId: sub.id,
          amount: 3000,
          method: "MERCADO_PAGO",
          status: "APPROVED",
          paidAt: now,
        },
      });
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async updateUser(id: number, data: any) {
    const { email, name, phone, role, patente, brand, model, color } = data;
    const user = await userRepository.update(id, {
      email,
      name,
      phone,
      role,
    });

    if (patente) {
      const formattedPatente = patente.toUpperCase().trim();
      const userVehicles = await prisma.vehicle.findMany({ where: { userId: id } });
      
      if (userVehicles.length > 0) {
        await prisma.vehicle.update({
          where: { id: userVehicles[0].id },
          data: {
            licensePlate: formattedPatente,
            brand: brand || userVehicles[0].brand,
            model: model || userVehicles[0].model,
            color: color || userVehicles[0].color,
          }
        });
      } else {
        const existingVehicle = await prisma.vehicle.findUnique({ where: { licensePlate: formattedPatente } });
        if (existingVehicle) {
          await prisma.vehicle.update({
            where: { id: existingVehicle.id },
            data: {
              userId: id,
              brand: brand || existingVehicle.brand,
              model: model || existingVehicle.model,
              color: color || existingVehicle.color,
            }
          });
        } else {
          await prisma.vehicle.create({
            data: {
              licensePlate: formattedPatente,
              userId: id,
              brand: brand || "Desconocido",
              model: model || "Desconocido",
              color: color || "Desconocido"
            }
          });
        }
      }

      // Check if user has an active subscription, if not, create one so they have a reserved space
      const activeSubs = await prisma.subscription.findMany({
        where: { userId: id, status: "ACTIVE", validUntil: { gte: new Date() } }
      });
      if (activeSubs.length === 0) {
        const now = new Date();
        const subscriptionUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const sub = await prisma.subscription.create({
          data: {
            userId: id,
            type: "DAILY",
            validFrom: now,
            validUntil: subscriptionUntil,
            status: "ACTIVE",
          },
        });

        await prisma.payment.create({
          data: {
            subscriptionId: sub.id,
            amount: 3000,
            method: "MERCADO_PAGO",
            status: "APPROVED",
            paidAt: now,
          },
        });
      }
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async patchUser(id: number, data: any) {
    const { patente, brand, model, color, ...restData } = data;
    const updateData: Prisma.UserUpdateInput = { ...restData };
    if (updateData.password && typeof updateData.password === "string") {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const user = await userRepository.update(id, updateData);

    if (patente) {
      const formattedPatente = patente.toUpperCase().trim();
      const userVehicles = await prisma.vehicle.findMany({ where: { userId: id } });
      
      if (userVehicles.length > 0) {
        await prisma.vehicle.update({
          where: { id: userVehicles[0].id },
          data: {
            licensePlate: formattedPatente,
            brand: brand !== undefined ? brand : userVehicles[0].brand,
            model: model !== undefined ? model : userVehicles[0].model,
            color: color !== undefined ? color : userVehicles[0].color,
          }
        });
      } else {
        const existingVehicle = await prisma.vehicle.findUnique({ where: { licensePlate: formattedPatente } });
        if (existingVehicle) {
          await prisma.vehicle.update({
            where: { id: existingVehicle.id },
            data: {
              userId: id,
              brand: brand || existingVehicle.brand,
              model: model || existingVehicle.model,
              color: color || existingVehicle.color,
            }
          });
        } else {
          await prisma.vehicle.create({
            data: {
              licensePlate: formattedPatente,
              userId: id,
              brand: brand || "Desconocido",
              model: model || "Desconocido",
              color: color || "Desconocido"
            }
          });
        }
      }

      // Check if user has an active subscription, if not, create one so they have a reserved space
      const activeSubs = await prisma.subscription.findMany({
        where: { userId: id, status: "ACTIVE", validUntil: { gte: new Date() } }
      });
      if (activeSubs.length === 0) {
        const now = new Date();
        const subscriptionUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const sub = await prisma.subscription.create({
          data: {
            userId: id,
            type: "DAILY",
            validFrom: now,
            validUntil: subscriptionUntil,
            status: "ACTIVE",
          },
        });

        await prisma.payment.create({
          data: {
            subscriptionId: sub.id,
            amount: 3000,
            method: "MERCADO_PAGO",
            status: "APPROVED",
            paidAt: now,
          },
        });
      }
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  },

  async deleteUser(id: number): Promise<void> {
    await userRepository.delete(id);
  },
};
