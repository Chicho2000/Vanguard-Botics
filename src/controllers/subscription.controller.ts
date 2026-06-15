import { Request, Response, NextFunction } from "express";
import { subscriptionService } from "../services/subscription.service";
import { AuthRequest } from "../middleware/auth";

export const subscriptionController = {
  async getActiveSubscription(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      const activeSub = await subscriptionService.getActiveSubscription(userId);
      res.json({ success: true, data: activeSub });
    } catch (error) {
      next(error);
    }
  },

  async changePlan(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      const { type } = req.body;
      if (!type || !["DAILY", "MONTHLY", "QUARTERLY", "YEARLY"].includes(type)) {
        return res.status(400).json({ success: false, message: "Tipo de plan de pago inválido" });
      }

      const newSub = await subscriptionService.changePlan(userId, type);
      res.json({ success: true, message: "Plan de pago cambiado con éxito", data: newSub });
    } catch (error) {
      next(error);
    }
  },

  async getSubscriptionsByUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: "No autenticado" });
      }

      const subscriptions = await subscriptionService.getSubscriptionsByUserId(userId);
      res.json({ success: true, data: subscriptions });
    } catch (error) {
      next(error);
    }
  },

  async getSubscriptionById(req: Request, res: Response, next: NextFunction) {
    try {
      const subscription = await subscriptionService.getSubscriptionById(parseInt(req.params.id as string, 10));
      if (!subscription) {
        return res.status(404).json({ success: false, message: "Abono no encontrado" });
      }
      res.json({ success: true, data: subscription });
    } catch (error) {
      next(error);
    }
  },
};
