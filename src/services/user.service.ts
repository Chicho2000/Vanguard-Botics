import bcrypt from "bcrypt";
import { Prisma, Role } from "@prisma/client";
import { userRepository } from "../repositories/user.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { subscriptionService } from "./subscription.service";
import { prisma } from "../lib/prisma";

interface UserInput {
  email?: string;
  password?: string;
  name?: string;
  phone?: string | null;
  role?: Role;
  patente?: string;
  brand?: string | null;
  model?: string | null;
  color?: string | null;
  assignedSpotId?: number | null;
}

const safeUser = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safe } = user;
  return safe;
};

const ensurePlateAvailable = async (plate: string, userId?: number) => {
  const vehicle = await vehicleRepository.findByLicensePlate(plate);
  if (vehicle?.userId && vehicle.userId !== userId) {
    throw { status: 409, message: "La patente ya pertenece a otro usuario" };
  }
  return vehicle;
};

const attachVehicle = async (userId: number, input: UserInput) => {
  if (!input.patente) return;
  const existingPlateVehicle = await ensurePlateAvailable(input.patente, userId);
  const userVehicles = await vehicleRepository.findByUserId(userId);
  const current = userVehicles[0];
  const details = {
    brand: input.brand ?? current?.brand ?? existingPlateVehicle?.brand ?? "Desconocido",
    model: null,
  };

  if (current) {
    await vehicleRepository.update(current.id, { licensePlate: input.patente, ...details });
  } else if (existingPlateVehicle) {
    await vehicleRepository.update(existingPlateVehicle.id, {
      user: { connect: { id: userId } },
      ...details,
    });
  } else {
    await vehicleRepository.create({
      licensePlate: input.patente,
      user: { connect: { id: userId } },
      ...details,
    });
  }

  if (input.role !== "INVITADO") {
    await subscriptionService.getActiveSubscription(userId);
  }
};

export const userService = {
  async getUsers() {
    const [users, guestSessions] = await Promise.all([
      userRepository.findMany(),
      prisma.parkingSession.findMany({
        where: { status: "ACTIVE", vehicle: { userId: null } },
        include: { vehicle: true, spot: { include: { floor: true } } },
        orderBy: { entryAt: "desc" },
      }),
    ]);
    return [
      ...users,
      ...guestSessions.map((session) => ({
        id: -session.id,
        email: `invitado_${session.vehicle.licensePlate}@local`,
        name: `Invitado (${session.vehicle.licensePlate})`,
        phone: null,
        role: "INVITADO" as const,
        createdAt: session.entryAt,
        vehicles: [{
          licensePlate: session.vehicle.licensePlate,
          brand: session.vehicle.brand,
          model: null,
          color: session.vehicle.color,
        }],
        assignedSpot: { id: session.spot.id, label: session.spot.label, floor: { name: session.spot.floor.name } },
        isTemporaryGuest: true,
      })),
    ];
  },

  async getUserById(id: number) {
    const user = await userRepository.findById(id);
    return user ? safeUser(user) : null;
  },

  async createUser(input: UserInput) {
    if (!input.email || !input.password || !input.name) throw { status: 400, message: "Faltan campos requeridos" };
    if (await userRepository.findByEmail(input.email)) throw { status: 409, message: "El email ya está registrado" };
    if (input.patente) await ensurePlateAvailable(input.patente);

    const user = await userRepository.create({
      email: input.email,
      password: await bcrypt.hash(input.password, 10),
      name: input.name,
      phone: input.phone,
      role: input.role ?? "CLIENTE",
    });
    await attachVehicle(user.id, input);
    if (input.assignedSpotId) {
      const { parkingSpotService } = await import("./parking-spot.service");
      await parkingSpotService.assignSpotAsAdmin(input.assignedSpotId, user.id);
      if (input.role === "INVITADO") {
        const vehicle = (await vehicleRepository.findByUserId(user.id))[0];
        if (vehicle) {
          const { parkingSessionService } = await import("./parking-session.service");
          await parkingSessionService.startRegisteredSession(
            { userId: user.id, role: "ADMIN" }, vehicle.id, input.assignedSpotId,
          );
        }
      }
    }
    return safeUser(user);
  },

  async updateUser(id: number, input: UserInput) {
    const data: Prisma.UserUpdateInput = {};
    if (input.email !== undefined) data.email = input.email;
    if (input.name !== undefined) data.name = input.name;
    if (input.phone !== undefined) data.phone = input.phone;
    if (input.role !== undefined) data.role = input.role;
    if (input.password) data.password = await bcrypt.hash(input.password, 10);
    if (input.patente) await ensurePlateAvailable(input.patente, id);

    const user = await userRepository.update(id, data);
    await attachVehicle(id, input);
    if (input.assignedSpotId) {
      const { parkingSpotService } = await import("./parking-spot.service");
      await parkingSpotService.assignSpotAsAdmin(input.assignedSpotId, id);
    } else if (input.assignedSpotId === null) {
      const { parkingSpotService } = await import("./parking-spot.service");
      await parkingSpotService.selectSpot(id, null);
    }
    return safeUser(user);
  },

  patchUser(id: number, input: UserInput) {
    return this.updateUser(id, input);
  },

  deleteUser: (id: number) => userRepository.delete(id),
};
