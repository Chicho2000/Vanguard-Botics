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

  const responseText = await response.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    if (!response.ok) {
      throw new Error(`Error del servidor (status ${response.status}): ${responseText.slice(0, 100)}`);
    }
    throw new Error("Respuesta del servidor inválida (no es JSON)");
  }

  if (!response.ok) {
    throw new Error(data.message || "Error al realizar la operación");
  }
  return data;
}

export const subscriptionService = {
  /**
   * Fetches the logged-in user's active subscription.
   */
  async getActiveSubscription() {
    const { data } = await fetchWithAuth(`${API_URL}/subscriptions/active`);
    return data;
  },

  /**
   * Changes the user's active subscription plan.
   * @param planType DAILY, MONTHLY, QUARTERLY, or YEARLY
   */
  async changePlan(planType: "DAILY" | "MONTHLY" | "QUARTERLY" | "YEARLY") {
    const { data } = await fetchWithAuth(`${API_URL}/subscriptions/change-plan`, {
      method: "POST",
      body: JSON.stringify({ type: planType }),
    });
    return data;
  },
};
