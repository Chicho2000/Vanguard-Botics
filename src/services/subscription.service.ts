import { subscriptionRepository } from "../repositories/subscription.repository";
import { systemConfigService } from "./system-config.service";
import { paymentRepository } from "../repositories/payment.repository";

export const subscriptionService = {
  async getActiveSubscription(userId: number) {
    let activeSub = await subscriptionRepository.findActiveByUserId(userId);

    // Si el abono activo ya expiró, marcarlo como expirado
    if (activeSub && new Date(activeSub.validUntil) < new Date()) {
      await subscriptionRepository.update(activeSub.id, { status: "EXPIRED" });
      activeSub = null;
    }

    // Si no hay abono activo, crear uno DAILY por defecto
    if (!activeSub) {
      const now = new Date();
      const until = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      activeSub = await subscriptionRepository.create({
          user: { connect: { id: userId } },
          type: "DAILY",
          validFrom: now,
          validUntil: until,
          status: "ACTIVE",
      });

      const systemConfigs = await systemConfigService.getConfigs();
      const amount = parseFloat(systemConfigs.rate_daily || "3000");

      await paymentRepository.create({
          subscription: { connect: { id: activeSub.id } },
          amount,
          method: "MERCADO_PAGO",
          status: "APPROVED",
          paidAt: now,
      });
    }

    return activeSub;
  },

  async changePlan(userId: number, type: "DAILY" | "MONTHLY" | "QUARTERLY" | "YEARLY") {
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

    const current = await subscriptionRepository.findActiveByUserId(userId);
    const updatedSub = current
      ? await subscriptionRepository.update(current.id, {
          type,
          validFrom: now,
          validUntil: until,
          status: "ACTIVE",
        })
      : await subscriptionRepository.create({
          user: { connect: { id: userId } },
          type,
          validFrom: now,
          validUntil: until,
          status: "ACTIVE",
        });

    // Obtener tarifa del sistema y crear pago asociado
    const systemConfigs = await systemConfigService.getConfigs();
    let rateKey = "rate_daily";
    if (type === "DAILY") rateKey = "rate_daily";
    else if (type === "MONTHLY") rateKey = "rate_monthly";
    else if (type === "QUARTERLY") rateKey = "rate_quarterly";
    else if (type === "YEARLY") rateKey = "rate_yearly";

    const amount = parseFloat(systemConfigs[rateKey] || "0");

    await paymentRepository.updateBySubscriptionId(updatedSub.id, amount, now);

    return updatedSub;
  },

  async getSubscriptionsByUserId(userId: number) {
    return await subscriptionRepository.findByUserId(userId);
  },

  async getSubscriptionById(id: number) {
    return await subscriptionRepository.findById(id);
  },
};
