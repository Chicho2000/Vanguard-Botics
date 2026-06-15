import { subscriptionRepository } from "../repositories/subscription.repository";
import { systemConfigService } from "./system-config.service";
import { prisma } from "../lib/prisma";

export const subscriptionService = {
  async getActiveSubscription(userId: number) {
    let activeSub = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        validUntil: "desc",
      },
    });

    // Si el abono activo ya expiró, marcarlo como expirado
    if (activeSub && new Date(activeSub.validUntil) < new Date()) {
      await prisma.subscription.update({
        where: { id: activeSub.id },
        data: { status: "EXPIRED" },
      });
      activeSub = null;
    }

    // Si no hay abono activo, crear uno DAILY por defecto
    if (!activeSub) {
      const now = new Date();
      const until = new Date(now.getTime() + 24 * 60 * 60 * 1000);
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

    return activeSub;
  },

  async changePlan(userId: number, type: "DAILY" | "MONTHLY" | "QUARTERLY" | "YEARLY") {
    // Cancelar abonos activos existentes
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

    // Crear nueva suscripción
    const newSub = await prisma.subscription.create({
      data: {
        userId,
        type,
        validFrom: now,
        validUntil: until,
        status: "ACTIVE",
      },
    });

    // Obtener tarifa del sistema y crear pago asociado
    const systemConfigs = await systemConfigService.getConfigs();
    let rateKey = "rate_daily";
    if (type === "DAILY") rateKey = "rate_daily";
    else if (type === "MONTHLY") rateKey = "rate_monthly";
    else if (type === "QUARTERLY") rateKey = "rate_quarterly";
    else if (type === "YEARLY") rateKey = "rate_yearly";

    const amount = parseFloat(systemConfigs[rateKey] || "0");

    await prisma.payment.create({
      data: {
        subscriptionId: newSub.id,
        amount,
        method: "MERCADO_PAGO",
        status: "APPROVED",
        paidAt: now,
      },
    });

    return newSub;
  },

  async getSubscriptionsByUserId(userId: number) {
    return await subscriptionRepository.findByUserId(userId);
  },

  async getSubscriptionById(id: number) {
    return await subscriptionRepository.findById(id);
  },
};
