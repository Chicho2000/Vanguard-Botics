import { parkingSpotRepository } from "../repositories/parking-spot.repository";

export const parkingSpotService = {
  async getSpots() {
    return await parkingSpotRepository.findAll();
  },

  async getSpotById(id: number) {
    return await parkingSpotRepository.findById(id);
  },

  async getSpotsByFloorId(floorId: number) {
    return await parkingSpotRepository.findByFloorId(floorId);
  },

  async getOccupancyStats() {
    const total = await parkingSpotRepository.count();
    const occupied = await parkingSpotRepository.countOccupied();
    return { total, occupied, available: total - occupied };
  },

  async updateSpot(id: number, data: any) {
    return await parkingSpotRepository.update(id, data);
  },
};
