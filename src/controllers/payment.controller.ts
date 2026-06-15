import { Request, Response, NextFunction } from "express";
import { paymentService } from "../services/payment.service";

export const paymentController = {
  async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const payments = await paymentService.getPayments();
      res.json({ success: true, data: payments });
    } catch (error) {
      next(error);
    }
  },

  async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getPaymentById(parseInt(req.params.id as string, 10));
      if (!payment) {
        return res.status(404).json({ success: false, message: "Pago no encontrado" });
      }
      res.json({ success: true, data: payment });
    } catch (error) {
      next(error);
    }
  },

  async getTodayRevenue(req: Request, res: Response, next: NextFunction) {
    try {
      const revenue = await paymentService.getTodayRevenue();
      res.json({ success: true, data: { revenue } });
    } catch (error) {
      next(error);
    }
  },
};
