import { Request, Response, NextFunction } from "express";
import { userService } from "../services/user.service";

export const userController = {
  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await userService.getUsers();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.getUserById(parseInt(req.params.id as string, 10));
      if (!user) {
        return res.status(404).json({ success: false, message: "Usuario no encontrado" });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.updateUser(parseInt(req.params.id as string, 10), req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async patchUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.patchUser(parseInt(req.params.id as string, 10), req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  },

  async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      await userService.deleteUser(parseInt(req.params.id as string, 10));
      res.json({ success: true, message: "Usuario eliminado" });
    } catch (error) {
      next(error);
    }
  },
};
