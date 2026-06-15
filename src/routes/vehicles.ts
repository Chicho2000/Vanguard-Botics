import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { vehicleController } from "../controllers/vehicle.controller";

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get("/", requireAdmin, vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.get("/plate/:plate", vehicleController.getVehicleByPlate);
router.post("/", vehicleController.createVehicle);
router.put("/:id", requireAdmin, vehicleController.updateVehicle);
router.delete("/:id", requireAdmin, vehicleController.deleteVehicle);

export default router;
