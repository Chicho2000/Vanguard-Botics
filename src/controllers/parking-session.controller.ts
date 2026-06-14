import { Request, Response, NextFunction } from "express";
import { parkingSessionService } from "../services/parking-session.service";

export const parkingSessionController = {
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await parkingSessionService.getRecentActivity();
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  },
};
