import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { systemConfigController } from "../controllers/system-config.controller";

const router = Router();

// Public endpoint (unauthenticated)
router.get("/public", systemConfigController.getPublicConfigs);

// Admin-only endpoints (authenticated)
router.get("/", requireAuth, requireAdmin, systemConfigController.getConfigs);
router.put("/", requireAuth, requireAdmin, systemConfigController.updateConfigs);

export default router;
