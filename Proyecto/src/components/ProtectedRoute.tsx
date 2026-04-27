import React, { useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    // Si no tiene el rol permitido, redirigir al panel correspondiente o a un "No Autorizado"
    if (user.rol === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.rol === "CLIENTE") return <Navigate to="/cliente" replace />;
    if (user.rol === "INVITADO") return <Navigate to="/invitado" replace />;
    
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
