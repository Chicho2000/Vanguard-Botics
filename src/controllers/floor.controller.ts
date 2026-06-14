import { Request, Response, NextFunction } from "express";
import { floorService } from "../services/floor.service";

export const floorController = {
  async getFloors(req: Request, res: Response, next: NextFunction) {
    try {
      const floors = await floorService.getFloorsOverview();
      res.json({ success: true, data: floors });
    } catch (error) {
      next(error);
    }
  },

  async getUserFloors(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const role = req.user.rol;
      const userPlate = req.user.patente;

      const floors = await floorService.getFloorsOverviewForUser(userId, role, userPlate);
      res.json({ success: true, data: floors });
    } catch (error) {
      next(error);
    }
  },
};
