import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { authService } from "../services/auth.service";

interface User {
  userId: number;
  email: string;
  nombre: string;
  rol: string;
  patente?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginInvitado: (licensePlate: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
