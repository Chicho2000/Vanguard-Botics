import { NextFunction, Request, Response } from "express";
import { securityConfig } from "../config/security";

type TurnstileResponse = { success?: boolean };

export const verifyTurnstile = async (req: Request, res: Response, next: NextFunction) => {
  if (!securityConfig.captchaRequired) return next();

  const token = req.body?.captchaToken;
  if (!securityConfig.turnstileSecretKey) {
    console.error("CAPTCHA_REQUIRED is true but TURNSTILE_SECRET_KEY is not configured");
    return res.status(503).json({ success: false, message: "El captcha no está configurado en el servidor" });
  }
  if (typeof token !== "string" || token.length < 20) {
    return res.status(403).json({ success: false, message: "Completá la verificación de seguridad" });
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: securityConfig.turnstileSecretKey,
        response: token,
        remoteip: req.ip ?? "",
      }),
      signal: AbortSignal.timeout(5_000),
    });
    const result = await response.json() as TurnstileResponse;
    if (!response.ok || !result.success) {
      return res.status(403).json({ success: false, message: "No se pudo validar el captcha. Intentá nuevamente" });
    }
    return next();
  } catch (error) {
    console.error("Turnstile verification failed:", error);
    return res.status(503).json({ success: false, message: "No se pudo verificar el captcha. Intentá nuevamente" });
  }
};
