import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { authService } from "../services/auth.service";
import { guestLoginSchema, loginSchema, registerSchema } from "../validation/schemas";
import { verifyTurnstile } from "../middleware/captcha";
import { clientIp, rateLimit } from "../middleware/rate-limit";

const router = Router();

router.post("/register", rateLimit({ windowMs: 60 * 60 * 1000, max: 3, key: (req) => `register:${clientIp(req)}` }), validateBody(registerSchema), verifyTurnstile, async (req, res) => {
  try {
    const { token, cookieOptions, user, expiresAt } = await authService.register(req.body);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ success: true, token, user, expiresAt });
  } catch (error: any) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 5, key: (req) => `login:${clientIp(req)}:${String(req.body?.email ?? "").toLowerCase()}` }), validateBody(loginSchema), verifyTurnstile, async (req, res) => {
  try {
    const { token, cookieOptions, user, expiresAt } = await authService.login(req.body.email, req.body.password);
    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, token, user, expiresAt });
  } catch (error: any) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/login/invitado", rateLimit({ windowMs: 15 * 60 * 1000, max: 5, key: (req) => `guest:${clientIp(req)}:${String(req.body?.licensePlate ?? "").toUpperCase()}` }), validateBody(guestLoginSchema), verifyTurnstile, async (req, res) => {
  try {
    const { token, cookieOptions, user, expiresAt } = await authService.loginInvitado(
      req.body.licensePlate, req.body.brand ?? undefined, req.body.spotId,
    );
    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, token, user, expiresAt });
  } catch (error: any) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.get("/verify", requireAuth, (req: AuthRequest, res) =>
  res.json({ success: true, user: req.user }));

router.post("/logout", (_req, res) => {
  res.clearCookie("token");
  return res.json({ success: true, message: "Sesión cerrada" });
});

export default router;
