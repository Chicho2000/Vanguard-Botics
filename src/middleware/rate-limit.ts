import { NextFunction, Request, Response } from "express";

type RateLimitOptions = {
  windowMs: number;
  max: number;
  key: (req: Request) => string;
};

type Attempt = { count: number; resetAt: number };

/**
 * Deliberately small, dependency-free limiter for authentication endpoints.
 * It is per process, so production with multiple Node instances should move
 * these counters to Redis or the reverse proxy.
 */
export const rateLimit = ({ windowMs, max, key }: RateLimitOptions) => {
  const attempts = new Map<string, Attempt>();

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    if (attempts.size > 10_000) {
      for (const [storedKey, item] of attempts) {
        if (item.resetAt <= now) attempts.delete(storedKey);
      }
    }
    const requestKey = key(req);
    const existing = attempts.get(requestKey);
    const attempt = !existing || existing.resetAt <= now
      ? { count: 0, resetAt: now + windowMs }
      : existing;

    attempt.count += 1;
    attempts.set(requestKey, attempt);

    if (attempt.count > max) {
      const retryAfter = Math.max(1, Math.ceil((attempt.resetAt - now) / 1000));
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        message: "Demasiados intentos. Esperá unos minutos antes de volver a intentar.",
      });
    }

    next();
  };
};

export const clientIp = (req: Request) => req.ip || req.socket.remoteAddress || "unknown";
