import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { parkingSpotController } from "../controllers/parking-spot.controller";

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get("/", parkingSpotController.getSpots);
router.post("/select", parkingSpotController.selectSpot);
router.get("/stats", parkingSpotController.getOccupancyStats);
router.get("/floor/:floorId", parkingSpotController.getSpotsByFloor);
router.get("/:id", parkingSpotController.getSpotById);
router.patch("/:id", requireAdmin, parkingSpotController.updateSpot);

export default router;
