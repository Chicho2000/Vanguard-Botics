import { Router } from "express";
import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me_in_production";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínima 6 caracteres"),
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    const email = parsed.data.email.toLowerCase();
    const { password } = parsed.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      nombre: user.name,
      rol: user.role,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;
    return res.json({ success: true, token, user: userWithoutPassword });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/login/invitado", async (req, res) => {
  try {
    const { licensePlate } = req.body;
    if (!licensePlate) {
      return res.status(400).json({ success: false, message: "Patente requerida" });
    }

    const tokenPayload = {
      userId: 0,
      email: `invitado_${licensePlate}@local`,
      nombre: `Invitado (${licensePlate})`,
      rol: "INVITADO",
      patente: licensePlate
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: "1d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({ success: true, token, user: tokenPayload });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.get("/verify", requireAuth, (req: AuthRequest, res) => {
  return res.json({ success: true, user: req.user });
});

router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out" });
});

export default router;
