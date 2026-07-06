import { Request, Response, NextFunction } from "express";
import { parkingSessionService } from "../services/parking-session.service";

export const parkingSessionController = {
  async startSession(req: any, res: Response, next: NextFunction) {
    try {
      const session = await parkingSessionService.startRegisteredSession(
        { userId: req.user.userId, role: req.user.rol }, req.body.vehicleId, req.body.spotId,
      );
      res.status(201).json({ success: true, data: session });
    } catch (error) { next(error); }
  },
  async getRecentActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const activity = await parkingSessionService.getRecentActivity();
      res.json({ success: true, data: activity });
    } catch (error) {
      next(error);
    }
  },

  async getCurrentSession(req: any, res: Response, next: NextFunction) {
    try {
      const session = await parkingSessionService.getCurrentSession({
        userId: req.user.userId,
        role: req.user.rol,
        licensePlate: req.user.patente,
      });
      res.json({ success: true, data: session });
    } catch (error) {
      next(error);
    }
  },

  async finishCurrentSession(req: any, res: Response, next: NextFunction) {
    try {
      const session = await parkingSessionService.finishCurrentSession({
        userId: req.user.userId,
        role: req.user.rol,
        licensePlate: req.user.patente,
      });
      res.json({ success: true, data: session });
    } catch (error) { next(error); }
  },

  async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Math.min(200, Math.max(1, Number(req.query.limit) || 100));
      res.json({ success: true, data: await parkingSessionService.getHistory(limit) });
    } catch (error) { next(error); }
  },
};
