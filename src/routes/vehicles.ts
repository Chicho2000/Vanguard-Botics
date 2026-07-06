import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { vehicleController } from "../controllers/vehicle.controller";
import { validateBody } from "../middleware/validate";
import { vehicleCreateSchema, vehicleUpdateSchema } from "../validation/schemas";

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get("/", requireAdmin, vehicleController.getVehicles);
router.get("/:id", vehicleController.getVehicleById);
router.get("/plate/:plate", vehicleController.getVehicleByPlate);
router.post("/", validateBody(vehicleCreateSchema), vehicleController.createVehicle);
router.put("/:id", requireAdmin, validateBody(vehicleUpdateSchema), vehicleController.updateVehicle);
router.delete("/:id", requireAdmin, vehicleController.deleteVehicle);

export default router;
