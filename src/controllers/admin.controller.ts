import { Request, Response, NextFunction } from "express";
import { adminService } from "../services/admin.service";

export const adminController = {
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await adminService.getRecentActivity();
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  },

  async getFloors(req: Request, res: Response, next: NextFunction) {
    try {
      const floors = await adminService.getFloorsOverview();
      res.json({ success: true, data: floors });
    } catch (error) {
      next(error);
    }
  },
};
