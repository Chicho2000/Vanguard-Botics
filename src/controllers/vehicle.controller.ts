import { Request, Response, NextFunction } from "express";
import { vehicleService } from "../services/vehicle.service";

export const vehicleController = {
  async getVehicles(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicles = await vehicleService.getVehicles();
      res.json({ success: true, data: vehicles });
    } catch (error) {
      next(error);
    }
  },

  async getVehicleById(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.getVehicleById(parseInt(req.params.id as string, 10));
      if (!vehicle) {
        return res.status(404).json({ success: false, message: "Vehículo no encontrado" });
      }
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async getVehicleByPlate(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.getVehicleByLicensePlate(req.params.plate as string);
      if (!vehicle) {
        return res.status(404).json({ success: false, message: "Vehículo no encontrado" });
      }
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async createVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.createVehicle(req.body);
      res.status(201).json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async updateVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      const vehicle = await vehicleService.updateVehicle(parseInt(req.params.id as string, 10), req.body);
      res.json({ success: true, data: vehicle });
    } catch (error) {
      next(error);
    }
  },

  async deleteVehicle(req: Request, res: Response, next: NextFunction) {
    try {
      await vehicleService.deleteVehicle(parseInt(req.params.id as string, 10));
      res.json({ success: true, message: "Vehículo eliminado" });
    } catch (error) {
      next(error);
    }
  },
};
