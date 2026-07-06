import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { parkingSessionRepository } from "../repositories/parking-session.repository";
import { subscriptionService } from "./subscription.service";
import { parkingSessionService } from "./parking-session.service";
import { parkingSpotService } from "./parking-spot.service";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me_in_production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const authService = {
  async register(data: { email: string; password: string; name: string; phone?: string; patente: string; brand?: string; assignedSpotId: number }) {
    const normalizedEmail = data.email.toLowerCase();
    const formattedPatente = data.patente.toUpperCase().trim();

    // 1. Check existing user
    const existingUser = await userRepository.findByEmail(normalizedEmail);
    if (existingUser) {
      throw { status: 409, message: "Ya existe una cuenta con este email" };
    }

    // 2. Check existing vehicle
    const existingVehicle = await vehicleRepository.findByLicensePlate(formattedPatente);
    if (existingVehicle && existingVehicle.userId !== null) {
      throw { status: 409, message: "Este vehículo ya está registrado por otro usuario" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // 3. Create user
    const user = await userRepository.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: "CLIENTE",
    });

    // 4. Create or link vehicle
    if (existingVehicle) {
      await vehicleRepository.update(existingVehicle.id, {
        user: { connect: { id: user.id } },
        brand: data.brand || existingVehicle.brand,
        model: null,
      });
    } else {
      await vehicleRepository.create({
        licensePlate: formattedPatente,
        user: { connect: { id: user.id } },
        brand: data.brand || "Desconocido",
        model: null,
      });
    }

    // 5. Provision the default plan through the subscription domain service.
    await subscriptionService.getActiveSubscription(user.id);
    await parkingSpotService.assignSpotAsAdmin(data.assignedSpotId, user.id);

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      nombre: user.name,
      rol: user.role,
      patente: formattedPatente,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    return {
      token,
      cookieOptions: { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 },
      user: tokenPayload,
    };
  },

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();

    const user = await userRepository.findByEmail(normalizedEmail);
    if (!user) {
      throw { status: 401, message: "Credenciales incorrectas" };
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw { status: 401, message: "Credenciales incorrectas" };
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      nombre: user.name,
      rol: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    return {
      token,
      cookieOptions: { ...COOKIE_OPTIONS, maxAge: 7 * 24 * 60 * 60 * 1000 },
      user: tokenPayload,
    };
  },

  async loginInvitado(licensePlate: string, brand?: string, spotId?: number) {
    let activeSession = await parkingSessionRepository.findActiveByLicensePlate(licensePlate);
    if (!activeSession && brand && spotId) {
      await parkingSessionService.startGuestSession(licensePlate, brand, spotId);
      activeSession = await parkingSessionRepository.findActiveByLicensePlate(licensePlate);
    }
    if (!activeSession) {
      throw { status: 400, message: "Elegí la marca y el lugar para registrar el ingreso" };
    }

    const tokenPayload = {
      userId: 0,
      email: `invitado_${licensePlate}@local`,
      nombre: `Invitado (${licensePlate})`,
      rol: "INVITADO",
      patente: licensePlate,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

    return {
      token,
      cookieOptions: { ...COOKIE_OPTIONS, maxAge: 24 * 60 * 60 * 1000 },
      user: tokenPayload,
    };
  },
};
