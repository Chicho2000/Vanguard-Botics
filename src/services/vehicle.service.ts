import { vehicleRepository } from "../repositories/vehicle.repository";

export const vehicleService = {
  async getVehicles() {
    return await vehicleRepository.findAll();
  },

  async getVehicleById(id: number) {
    return await vehicleRepository.findById(id);
  },

  async getVehicleByLicensePlate(licensePlate: string) {
    return await vehicleRepository.findByLicensePlate(licensePlate);
  },

  async getVehiclesByUserId(userId: number) {
    return await vehicleRepository.findByUserId(userId);
  },

  async createVehicle(data: any) {
    const { licensePlate, userId, brand, model, color, heightCm, widthCm, weightKg } = data;
    return await vehicleRepository.create({
      licensePlate,
      brand,
      model,
      color,
      heightCm: heightCm ? parseFloat(heightCm) : null,
      widthCm: widthCm ? parseFloat(widthCm) : null,
      weightKg: weightKg ? parseFloat(weightKg) : null,
      ...(userId ? { user: { connect: { id: userId } } } : {}),
    });
  },

  async updateVehicle(id: number, data: any) {
    return await vehicleRepository.update(id, data);
  },

  async deleteVehicle(id: number): Promise<void> {
    await vehicleRepository.delete(id);
  },
};
