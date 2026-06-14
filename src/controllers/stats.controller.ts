import { Request, Response, NextFunction } from "express";
import { statsService } from "../services/stats.service";

export const statsController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await statsService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },
};
