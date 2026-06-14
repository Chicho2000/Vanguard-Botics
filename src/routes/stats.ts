import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { statsController } from "../controllers/stats.controller";

const router = Router();

router.get("/", requireAuth, requireAdmin, statsController.getStats);

export default router;
