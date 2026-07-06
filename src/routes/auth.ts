import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { authService } from "../services/auth.service";
import { guestLoginSchema, loginSchema, registerSchema } from "../validation/schemas";

const router = Router();

router.post("/register", validateBody(registerSchema), async (req, res) => {
  try {
    const { token, cookieOptions, user } = await authService.register(req.body);
    res.cookie("token", token, cookieOptions);
    return res.status(201).json({ success: true, token, user });
  } catch (error: any) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/login", validateBody(loginSchema), async (req, res) => {
  try {
    const { token, cookieOptions, user } = await authService.login(req.body.email, req.body.password);
    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, token, user });
  } catch (error: any) {
    if (error.status) return res.status(error.status).json({ success: false, message: error.message });
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error interno del servidor" });
  }
});

router.post("/login/invitado", validateBody(guestLoginSchema), async (req, res) => {
  try {
    const { token, cookieOptions, user } = await authService.loginInvitado(
      req.body.licensePlate, req.body.brand ?? undefined, req.body.spotId,
    );
    res.cookie("token", token, cookieOptions);
    return res.json({ success: true, token, user });
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
