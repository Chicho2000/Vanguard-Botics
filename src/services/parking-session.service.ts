import { parkingSessionRepository } from "../repositories/parking-session.repository";

export const parkingSessionService = {
  async getRecentActivity() {
    const sessions = await parkingSessionRepository.findRecent(10);

    return sessions.map((session) => ({
      id: session.id,
      plate: session.vehicle.licensePlate,
      brand: session.vehicle.brand,
      model: session.vehicle.model,
      spot: session.spot.label,
      floor: session.spot.floor.name,
      entryAt: session.entryAt,
      exitAt: session.exitAt,
      status: session.status,
      amount: session.amountCharged,
    }));
  },
};
