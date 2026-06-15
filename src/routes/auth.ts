import { Router } from "express";
import { z } from "zod";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { authService } from "../services/auth.service";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínima 6 caracteres"),
});

const registerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Contraseña mínima 6 caracteres"),
  name: z.string().min(2, "Nombre mínimo 2 caracteres"),
  phone: z.string().optional(),
  patente: z.string().min(6, "Patente mínima 6 caracteres"),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
});

// ─── REGISTRO DE NUEVO USUARIO ───────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((e) => e.message);
      return res.status(400).json({ success: false, message: errors.join(", ") });
    }

    const { token, cookieOptions, user } = await authService.register(parsed.data);

    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ success: true, token, user });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ─── LOGIN ───────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

    const { token, cookieOptions, user } = await authService.login(
      parsed.data.email,
      parsed.data.password
    );

    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, token, user });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ─── LOGIN INVITADO ──────────────────────────────────────────
router.post("/login/invitado", (req, res) => {
  try {
    const { licensePlate } = req.body;
    const { token, cookieOptions, user } = authService.loginInvitado(licensePlate);

    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, token, user });
  } catch (error: any) {
    if (error.status) {
      return res.status(error.status).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

// ─── VERIFICAR TOKEN ─────────────────────────────────────────
router.get("/verify", requireAuth, (req: AuthRequest, res) => {
  return res.json({ success: true, user: req.user });
});

// ─── LOGOUT ──────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Logged out" });
});

export default router;
