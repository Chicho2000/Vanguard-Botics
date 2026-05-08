import { authService } from "./auth.service";

const API_URL = "http://localhost:3000";

async function fetchWithAuth(url: string) {
  const token = authService.getToken();
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Error al obtener datos");
  }
  return data;
}

export const adminService = {
  async getStats() {
    const { data } = await fetchWithAuth(`${API_URL}/admin/stats`);
    return data;
  },

  async getRecentActivity() {
    const { data } = await fetchWithAuth(`${API_URL}/admin/activity`);
    return data;
  },

  async getFloors() {
    const { data } = await fetchWithAuth(`${API_URL}/admin/floors`);
    return data;
  },
};
