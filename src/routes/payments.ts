import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth";
import { paymentController } from "../controllers/payment.controller";

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get("/", requireAdmin, paymentController.getPayments);
router.get("/revenue/today", requireAdmin, paymentController.getTodayRevenue);
router.get("/:id", requireAdmin, paymentController.getPaymentById);

export default router;
