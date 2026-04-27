import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_key_change_me_in_production";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Credenciales incorrectas" });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.rol !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Acceso denegado" });
  }
  next();
};
