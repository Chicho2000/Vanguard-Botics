import { paymentRepository } from "../repositories/payment.repository";

export const paymentService = {
  getPayments: () => paymentRepository.findAll(),
  getPaymentById: (id: number) => paymentRepository.findById(id),
  getPaymentsBySessionId: (sessionId: number) => paymentRepository.findBySessionId(sessionId),
  getPaymentsBySubscriptionId: (subscriptionId: number) => paymentRepository.findBySubscriptionId(subscriptionId),
  getTodayRevenue: () => paymentRepository.getTodayRevenue(),
};
