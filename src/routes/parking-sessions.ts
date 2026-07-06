import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { parkingSessionController } from "../controllers/parking-session.controller";
import { validateBody } from "../middleware/validate";
import { parkingEntrySchema } from "../validation/schemas";

const router = Router();

router.post("/entry", requireAuth, validateBody(parkingEntrySchema), parkingSessionController.startSession);
router.get("/current", requireAuth, parkingSessionController.getCurrentSession);
router.post("/current/exit", requireAuth, parkingSessionController.finishCurrentSession);
router.get("/history", requireAuth, requireAdmin, parkingSessionController.getHistory);
router.get("/activity", requireAuth, requireAdmin, parkingSessionController.getRecentActivity);

export default router;
