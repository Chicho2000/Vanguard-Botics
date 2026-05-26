import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me_in_production";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

export const authService = {
  async register(data: { email: string; password: string; name: string; phone?: string }) {
    const normalizedEmail = data.email.toLowerCase();

    const existing = await authRepository.findUserByEmail(normalizedEmail);
    if (existing) {
      throw { status: 409, message: "Ya existe una cuenta con este email" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await authRepository.createUser({
      email: normalizedEmail,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: "CLIENTE",
    });

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

  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase();

    const user = await authRepository.findUserByEmail(normalizedEmail);
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
