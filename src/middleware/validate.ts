import { NextFunction, Request, Response } from "express";
import { ZodType } from "zod";

export const validateBody = (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
    }
    req.body = parsed.data;
    next();
  };
