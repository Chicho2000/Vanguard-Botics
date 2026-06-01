import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import type { ReactNode } from "react";
import { authService } from "../services/auth.service";

interface User {
  userId: number;
  email: string;
  nombre: string;
  rol: string;
  patente?: string;
}

/**
 * Tipo de dato que define las propiedades y métodos expuestos por el contexto de autenticación.
 * 
 * @interface AuthContextType
 */
interface AuthContextType {
  /** El objeto de usuario autenticado o null si no hay sesión activa. */
  user: User | null;
  /** Flag que indica si el usuario está autenticado. */
  isAuthenticated: boolean;
  /** Función para iniciar sesión mediante correo y contraseña. */
  login: (email: string, pass: string) => Promise<void>;
  /** Función para registrar un nuevo usuario en la plataforma. */
  register: (email: string, pass: string, name: string, phone?: string) => Promise<void>;
  /** Función para iniciar sesión como invitado usando una patente de vehículo. */
  loginInvitado: (licensePlate: string) => Promise<void>;
  /** Función para cerrar la sesión activa y limpiar el almacenamiento local. */
  logout: () => void;
  /** Flag que indica si hay una operación de autenticación en progreso. */
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Proveedor del contexto de autenticación. Envuelve la aplicación o las rutas protegidas
 * para suministrar el estado de sesión y los métodos de login/registro a todos los componentes hijos.
 * 
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {ReactNode} props.children - Elementos hijos a renderizar.
 * @returns {JSX.Element} El proveedor de contexto de React.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState(false);

  // Sync state with localStorage on mount just in case
  useEffect(() => {
    const checkAuth = () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser && (!user || currentUser.userId !== user.userId)) {
        setUser(currentUser);
      }
    };
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, [user]);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const { user: userData } = await authService.login(email, pass);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, pass: string, name: string, phone?: string) => {
    setIsLoading(true);
    try {
      const { user: userData } = await authService.register({ email, password: pass, name, phone });
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const loginInvitado = async (licensePlate: string) => {
    setIsLoading(true);
    try {
      const { user: userData } = await authService.loginInvitado(licensePlate);
      setUser(userData);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // vercel-react-best-practices: rerender-memo-with-default-value
  // Memoize the context value to prevent unnecessary re-renders of consuming components
  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    register,
    loginInvitado,
    logout,
    isLoading
  }), [user, isLoading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook personalizado para acceder de forma simplificada al contexto de autenticación.
 * Debe ser utilizado dentro del componente `AuthProvider`.
 * 
 * @returns {AuthContextType} El estado y métodos de autenticación del usuario.
 * @throws {Error} Si el hook se invoca fuera de un `AuthProvider`.
 * 
 * @example
 * const { user, logout } = useAuth();
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
