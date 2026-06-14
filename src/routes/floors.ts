import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { floorController } from "../controllers/floor.controller";

const router = Router();

// Protect all floor routes
router.use(requireAuth);

router.get("/", requireAdmin, floorController.getFloors);
router.get("/user-overview", floorController.getUserFloors);

export default router;
