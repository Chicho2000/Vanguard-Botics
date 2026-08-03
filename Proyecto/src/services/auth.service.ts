/**
 * @fileoverview Servicio de autenticación para realizar peticiones HTTP a la API de Vanguard Botics
 * y gestionar la sesión del usuario en el almacenamiento local (localStorage).
 * @version 1.0.0
 */

const API_URL = window.location.pathname.startsWith('/~')
  ? `/${window.location.pathname.split('/')[1]}/api`
  : 'http://localhost:3000';

/**
 * Servicio encargado de gestionar el estado de autenticación y las peticiones al backend.
 */
export const authService = {
  storeSession(data: any) {
    if (data.token) localStorage.setItem("token", data.token);
    if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
    if (data.expiresAt) localStorage.setItem("sessionExpiresAt", data.expiresAt);
  },
  /**
   * Inicia sesión en el sistema mediante correo electrónico y contraseña.
   * Almacena el token JWT y el perfil de usuario en el localStorage en caso de éxito.
   * 
   * @param {string} email - Correo electrónico del usuario.
   * @param {string} password - Contraseña del usuario.
   * @returns {Promise<any>} Promesa con los datos devueltos por el servidor (token, usuario).
   * @throws {Error} Si la respuesta HTTP no es exitosa o las credenciales son incorrectas.
   */
  async login(email: string, password: string, captchaToken?: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, captchaToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Credenciales incorrectas");
    }

    if (data.token) this.storeSession(data);

    return data;
  },

  /**
   * Registra un nuevo usuario en la plataforma Vanguard Botics.
   * Almacena el token y el perfil devueltos en el localStorage en caso de éxito.
   * 
   * @param {Object} payload - Datos de registro del usuario.
   * @param {string} payload.email - Correo electrónico.
   * @param {string} payload.password - Contraseña.
   * @param {string} payload.name - Nombre del usuario.
   * @param {string} [payload.phone] - Número telefónico (opcional).
   * @param {string} [payload.patente] - Patente del vehículo (opcional).
   * @param {string} [payload.brand] - Marca del vehículo (opcional).
   * @returns {Promise<any>} Promesa con los datos devueltos por el servidor.
   * @throws {Error} Si el registro falla.
   */
  async register(payload: { email: string; password: string; name: string; phone?: string; patente?: string; brand?: string; assignedSpotId: number; captchaToken?: string }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al registrar");
    }

    if (data.token) this.storeSession(data);

    return data;
  },

  /**
   * Inicia sesión para un usuario de tipo Invitado utilizando la patente de su vehículo.
   * Almacena el token de invitado en el localStorage.
   * 
   * @param {string} licensePlate - Patente del vehículo ingresante (ej: AB123CD).
   * @returns {Promise<any>} Promesa con los datos devueltos por el servidor.
   * @throws {Error} Si el servidor retorna un error al autenticar la patente.
   */
  async loginInvitado(licensePlate: string, brand?: string, spotId?: number, captchaToken?: string) {
    const response = await fetch(`${API_URL}/auth/login/invitado`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licensePlate, brand, spotId, captchaToken }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Error al ingresar como invitado");
    }

    if (data.token) this.storeSession(data);

    return data;
  },

  /**
   * Cierra la sesión del usuario actual eliminando los tokens de localStorage
   * y realizando una llamada para invalidar el token en el backend.
   * 
   * @returns {Promise<Response | void>} Promesa de la petición de logout (falla silenciosa).
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("sessionExpiresAt");
    return fetch(`${API_URL}/auth/logout`, { method: "POST" }).catch(() => { });
  },

  /**
   * Obtiene los datos del usuario autenticado actualmente desde el localStorage.
   * 
   * @returns {Object|null} El objeto de usuario parseado o null si no existe o es inválido.
   */
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  /**
   * Obtiene el token JWT actual de la sesión del usuario.
   * 
   * @returns {string|null} El token de autenticación o null si no hay sesión iniciada.
   */
  getToken() {
    return localStorage.getItem("token");
  },

  getSessionExpiresAt() {
    const saved = Date.parse(localStorage.getItem("sessionExpiresAt") || "");
    if (Number.isFinite(saved)) return saved;
    try {
      const payload = this.getToken()?.split(".")[1];
      if (!payload) return null;
      const parsed = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
      return typeof parsed.exp === "number" ? parsed.exp * 1000 : null;
    } catch { return null; }
  },

  isSessionExpired() {
    const expiresAt = this.getSessionExpiresAt();
    return expiresAt !== null && expiresAt <= Date.now();
  },

  /**
   * Verifica si existe una sesión activa basándose en la existencia de un token JWT.
   * 
   * @returns {boolean} True si el usuario tiene un token almacenado, False de lo contrario.
   */
  isAuthenticated() {
    if (this.isSessionExpired()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("sessionExpiresAt");
      return false;
    }
    return !!this.getToken();
  }
};
