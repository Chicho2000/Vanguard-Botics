import { authService } from "./auth.service";

const API_URL = window.location.pathname.startsWith('/~')
  ? `/${window.location.pathname.split('/')[1]}/api`
  : 'http://localhost:3000';

async function fetchWithAuth(url: string, options?: RequestInit) {
  const token = authService.getToken();
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Error al realizar la operación");
  }
  return data;
}

export const adminService = {
  async getStats() {
    const { data } = await fetchWithAuth(`${API_URL}/stats`);
    return data;
  },

  async getRecentActivity() {
    const { data } = await fetchWithAuth(`${API_URL}/parking-sessions/activity`);
    return data;
  },

  async getFloors() {
    const { data } = await fetchWithAuth(`${API_URL}/floors`);
    return data;
  },

  async getFloorsForUser() {
    const { data } = await fetchWithAuth(`${API_URL}/floors/user-overview`);
    return data;
  },

  async getConfigs() {
    const { data } = await fetchWithAuth(`${API_URL}/system-configs`);
    return data;
  },

  async getPublicConfigs() {
    const response = await fetch(`${API_URL}/system-configs/public`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al obtener datos públicos");
    }
    return data.data;
  },

  async updateConfigs(configs: Record<string, string>) {
    const { data } = await fetchWithAuth(`${API_URL}/system-configs`, {
      method: "PUT",
      body: JSON.stringify(configs),
    });
    return data;
  },

  async getUsers() {
    const { data } = await fetchWithAuth(`${API_URL}/users`);
    return data;
  },

  async createUser(user: any) {
    const { data } = await fetchWithAuth(`${API_URL}/users`, {
      method: "POST",
      body: JSON.stringify(user),
    });
    return data;
  },

  async updateUser(id: number, user: any) {
    const { data } = await fetchWithAuth(`${API_URL}/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(user),
    });
    return data;
  },

  async deleteUser(id: number) {
    const { data } = await fetchWithAuth(`${API_URL}/users/${id}`, {
      method: "DELETE",
    });
    return data;
  },
};

