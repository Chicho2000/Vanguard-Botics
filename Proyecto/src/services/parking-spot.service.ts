const API_URL = window.location.pathname.startsWith('/~')
  ? `/${window.location.pathname.split('/')[1]}/api`
  : 'http://localhost:3000';

export interface AvailableSpot {
  id: number;
  label: string;
  spotType: string;
  floor: { name: string; level: number };
}

export const parkingSpotService = {
  async getAvailable(): Promise<AvailableSpot[]> {
    const response = await fetch(`${API_URL}/parking-spots/available`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("El backend desplegado no incluye todavía la ruta de lugares disponibles");
    }
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || "No se pudieron cargar los lugares");
    return payload.data;
  },
};
