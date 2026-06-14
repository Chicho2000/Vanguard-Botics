import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { parkingSessionController } from "../controllers/parking-session.controller";

const router = Router();

router.get("/activity", requireAuth, requireAdmin, parkingSessionController.getRecentActivity);

export default router;
