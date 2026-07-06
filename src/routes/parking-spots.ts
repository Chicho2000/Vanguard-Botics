import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { parkingSpotController } from "../controllers/parking-spot.controller";
import { validateBody } from "../middleware/validate";
import { clientSpotSelectionSchema, parkingSessionMoveSchema, parkingSpotAssignmentSchema, parkingSpotRelocateSchema } from "../validation/schemas";

const router = Router();

router.get("/available", parkingSpotController.getAvailableSpots);
// Protect all routes
router.use(requireAuth);

router.get("/", parkingSpotController.getSpots);
router.post("/select", validateBody(clientSpotSelectionSchema), parkingSpotController.selectSpot);
router.get("/stats", parkingSpotController.getOccupancyStats);
router.get("/floor/:floorId", parkingSpotController.getSpotsByFloor);
router.get("/:id", parkingSpotController.getSpotById);
router.patch("/:id/assignment", requireAdmin, validateBody(parkingSpotAssignmentSchema), parkingSpotController.assignSpot);
router.patch("/:id/move-session", requireAdmin, validateBody(parkingSessionMoveSchema), parkingSpotController.moveSession);
router.patch("/:id/relocate", requireAdmin, validateBody(parkingSpotRelocateSchema), parkingSpotController.relocate);

export default router;
