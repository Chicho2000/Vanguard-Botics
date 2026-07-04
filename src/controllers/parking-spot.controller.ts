import { Request, Response, NextFunction } from "express";
import { parkingSpotService } from "../services/parking-spot.service";

export const parkingSpotController = {
  async getSpots(req: Request, res: Response, next: NextFunction) {
    try {
      const spots = await parkingSpotService.getSpots();
      res.json({ success: true, data: spots });
    } catch (error) {
      next(error);
    }
  },

  async getSpotById(req: Request, res: Response, next: NextFunction) {
    try {
      const spot = await parkingSpotService.getSpotById(parseInt(req.params.id as string, 10));
      if (!spot) {
        return res.status(404).json({ success: false, message: "Espacio no encontrado" });
      }
      res.json({ success: true, data: spot });
    } catch (error) {
      next(error);
    }
  },

  async getSpotsByFloor(req: Request, res: Response, next: NextFunction) {
    try {
      const spots = await parkingSpotService.getSpotsByFloorId(parseInt(req.params.floorId as string, 10));
      res.json({ success: true, data: spots });
    } catch (error) {
      next(error);
    }
  },

  async getOccupancyStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await parkingSpotService.getOccupancyStats();
      res.json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  },

  async updateSpot(req: Request, res: Response, next: NextFunction) {
    try {
      const spot = await parkingSpotService.updateSpot(parseInt(req.params.id as string, 10), req.body);
      res.json({ success: true, data: spot });
    } catch (error) {
      next(error);
    }
  },

  async selectSpot(req: any, res: Response, next: NextFunction) {
    try {
      const userId = req.user.userId;
      const role = req.user.rol;
      if (role !== "CLIENTE") {
        return res.status(403).json({ success: false, message: "Solo los clientes pueden elegir un espacio de estacionamiento" });
      }

      const { spotId } = req.body;
      const parsedSpotId = (spotId !== undefined && spotId !== null) ? Number(spotId) : null;
      const result = await parkingSpotService.selectSpot(userId, parsedSpotId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
