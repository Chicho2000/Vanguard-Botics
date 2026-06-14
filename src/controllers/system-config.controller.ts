import { Request, Response, NextFunction } from "express";
import { systemConfigService } from "../services/system-config.service";

export const systemConfigController = {
  async getConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = await systemConfigService.getConfigs();
      res.json({ success: true, data: configs });
    } catch (error) {
      next(error);
    }
  },

  async getPublicConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const allConfigs = await systemConfigService.getConfigs();
      const publicConfigs = {
        rate_hourly: allConfigs.rate_hourly,
        rate_daily: allConfigs.rate_daily,
        rate_monthly: allConfigs.rate_monthly,
        rate_yearly: allConfigs.rate_yearly,
        parking_name: allConfigs.parking_name,
        welcome_message: allConfigs.welcome_message,
      };
      res.json({ success: true, data: publicConfigs });
    } catch (error) {
      next(error);
    }
  },

  async updateConfigs(req: Request, res: Response, next: NextFunction) {
    try {
      const configs = req.body;
      if (!configs || typeof configs !== "object") {
        return res.status(400).json({
          success: false,
          message: "El cuerpo de la solicitud debe ser un objeto con configuraciones",
        });
      }

      const updatedConfigs = await systemConfigService.updateConfigs(configs);
      res.json({
        success: true,
        data: updatedConfigs,
        message: "Configuraciones actualizadas con éxito",
      });
    } catch (error) {
      next(error);
    }
  },
};
