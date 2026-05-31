
import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { adminController } from "../controllers/admin.controller";
import { configController } from "../controllers/config.controller";

const router = Router();

// ─── RUTAS PÚBLICAS (sin autenticación) ──────────────────────
// Devuelve solo los campos de tarifa que los invitados necesitan
router.get("/config/public", configController.getPublicConfigs);

// Todas las rutas debajo requieren autenticación + rol ADMIN
router.use(requireAuth, requireAdmin);

router.get("/stats", adminController.getStats);
router.get("/activity", adminController.getRecentActivity);
router.get("/floors", adminController.getFloors);

// Rutas de configuración de la cochera
router.get("/config", configController.getConfigs);
router.put("/config", configController.updateConfigs);

export default router;


