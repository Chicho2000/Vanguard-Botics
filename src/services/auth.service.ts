import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userRepository } from "../repositories/user.repository";
import { vehicleRepository } from "../repositories/vehicle.repository";
import { prisma } from "../lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me_in_production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const authService = {
  async register(data: { email: string; password: string; name: string; phone?: string; patente: string; brand?: string; model?: string; color?: string }) {
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
        model: data.model || existingVehicle.model,
        color: data.color || existingVehicle.color,
      });
    } else {
      await vehicleRepository.create({
        licensePlate: formattedPatente,
        user: { connect: { id: user.id } },
        brand: data.brand || "Desconocido",
        model: data.model || "Desconocido",
        color: data.color || "Desconocido",
      });
    }

    // 5. Create default active DAILY subscription and payment
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

  loginInvitado(licensePlate: string) {
    if (!licensePlate) {
      throw { status: 400, message: "Patente requerida" };
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
