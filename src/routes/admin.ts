import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { adminController } from "../controllers/admin.controller";

const router = Router();

// Todas las rutas requieren autenticación + rol ADMIN
router.use(requireAuth, requireAdmin);

router.get("/stats", adminController.getStats);
router.get("/activity", adminController.getRecentActivity);
router.get("/floors", adminController.getFloors);

export default router;
