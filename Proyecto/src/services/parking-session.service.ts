import { authService } from "./auth.service";

const API_URL = window.location.pathname.startsWith('/~')
  ? `/${window.location.pathname.split('/')[1]}/api`
  : 'http://localhost:3000';

export interface CurrentParkingSession {
  id: number;
  licensePlate: string;
  vehicle: { brand: string | null; model: string | null; color: string | null };
  spot: string;
  floor: string;
  entryAt: string;
  elapsedMinutes: number;
  billableHours: number;
  hourlyRate: number;
  estimatedAmount: number;
  paymentStatus: string | null;
}

export const parkingSessionService = {
  async getCurrent(): Promise<CurrentParkingSession> {
    const response = await fetch(`${API_URL}/parking-sessions/current`, {
      headers: { Authorization: `Bearer ${authService.getToken()}` },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "No se pudo consultar el estacionamiento");
    return payload.data;
  },
  async finishCurrent() {
    const response = await fetch(`${API_URL}/parking-sessions/current/exit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authService.getToken()}` },
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "No se pudo registrar la salida");
    return payload.data;
  },
};
