import { Router } from "express";
import { requireAuth, AuthRequest } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { systemConfigService } from "../services/system-config.service";

const router = Router();

// Protect all routes
router.use(requireAuth);

// Get user's active subscription (auto-creates default DAILY if none exists)
router.get("/active", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    let activeSub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        validUntil: "desc",
      },
    });

    // If an active subscription has expired, update it
    if (activeSub && new Date(activeSub.validUntil) < new Date()) {
      await prisma.subscription.update({
        where: { id: activeSub.id },
        data: { status: "EXPIRED" },
      });
      activeSub = null;
    }

    // If no active subscription exists, automatically create a default DAILY subscription
    if (!activeSub) {
      const now = new Date();
      const until = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      activeSub = await prisma.subscription.create({
        data: {
          userId,
          type: "DAILY",
          validFrom: now,
          validUntil: until,
          status: "ACTIVE",
        },
      });

      const systemConfigs = await systemConfigService.getConfigs();
      const amount = parseFloat(systemConfigs.rate_daily || "3000");

      await prisma.payment.create({
        data: {
          subscriptionId: activeSub.id,
          amount,
          method: "MERCADO_PAGO",
          status: "APPROVED",
          paidAt: now,
        },
      });
    }

    return res.json({ success: true, data: activeSub });
  } catch (error) {
    console.error("Error fetching active subscription:", error);
    return res.status(500).json({ success: false, message: "Error al obtener abono activo" });
  }
});

// Change/Update subscription plan for the registered user
router.post("/change-plan", async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const { type } = req.body;
    if (!type || !["DAILY", "MONTHLY", "QUARTERLY", "YEARLY"].includes(type)) {
      return res.status(400).json({ success: false, message: "Tipo de plan de pago inválido" });
    }

    // Cancel any currently active subscriptions for the user
    await prisma.subscription.updateMany({
      where: {
        userId,
        status: "ACTIVE",
      },
      data: {
        status: "CANCELLED",
      },
    });

    const now = new Date();
    let until = new Date();
    if (type === "DAILY") {
      until.setDate(now.getDate() + 1);
    } else if (type === "MONTHLY") {
      until.setMonth(now.getMonth() + 1);
    } else if (type === "QUARTERLY") {
      until.setMonth(now.getMonth() + 3);
    } else if (type === "YEARLY") {
      until.setFullYear(now.getFullYear() + 1);
    }

    // Create the new subscription
    const newSub = await prisma.subscription.create({
      data: {
        userId,
        type,
        validFrom: now,
        validUntil: until,
        status: "ACTIVE",
      },
    });

    // Get pricing from system configurations
    const systemConfigs = await systemConfigService.getConfigs();
    let rateKey = "rate_daily";
    if (type === "DAILY") rateKey = "rate_daily";
    else if (type === "MONTHLY") rateKey = "rate_monthly";
    else if (type === "QUARTERLY") rateKey = "rate_quarterly";
    else if (type === "YEARLY") rateKey = "rate_yearly";

    const amount = parseFloat(systemConfigs[rateKey] || "0");

    // Create the associated approved payment
    await prisma.payment.create({
      data: {
        subscriptionId: newSub.id,
        amount,
        method: "MERCADO_PAGO",
        status: "APPROVED",
        paidAt: now,
      },
    });

    return res.json({ success: true, message: "Plan de pago cambiado con éxito", data: newSub });
  } catch (error) {
    console.error("Error changing subscription plan:", error);
    return res.status(500).json({ success: false, message: "Error al cambiar el plan de pago" });
  }
});

export default router;
