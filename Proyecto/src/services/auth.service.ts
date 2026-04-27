const API_URL = "http://localhost:3000";

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Credenciales incorrectas");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  async loginInvitado(licensePlate: string) {
    const response = await fetch(`${API_URL}/auth/login/invitado`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licensePlate }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al ingresar como invitado");
    }

    if (data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    }

    return data;
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return fetch(`${API_URL}/auth/logout`, { method: "POST" }).catch(() => {});
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken() {
    return localStorage.getItem("token");
  },

  isAuthenticated() {
    return !!this.getToken();
  }
};
