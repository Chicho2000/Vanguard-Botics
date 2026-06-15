import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { subscriptionController } from "../controllers/subscription.controller";

const router = Router();

// Protect all routes
router.use(requireAuth);

router.get("/active", subscriptionController.getActiveSubscription);
router.post("/change-plan", subscriptionController.changePlan);
router.get("/my", subscriptionController.getSubscriptionsByUser);
router.get("/:id", subscriptionController.getSubscriptionById);

export default router;
