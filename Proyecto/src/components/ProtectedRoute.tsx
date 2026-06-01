/**
 * @fileoverview Componente de ruta protegida para controlar el acceso según la autenticación y roles de usuario.
 * @version 1.0.0
 */

import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Propiedades del componente ProtectedRoute.
 * 
 * @interface ProtectedRouteProps
 */
interface ProtectedRouteProps {
  /** Los componentes hijos que se renderizarán si el acceso es concedido. */
  children: React.ReactNode;
  /** Lista de roles permitidos para acceder a la ruta (ej: ['ADMIN', 'CLIENTE']). Si no se especifica, permite cualquier usuario autenticado. */
  allowedRoles?: string[];
}

/**
 * Componente que envuelve rutas para protegerlas. Verifica si el usuario está autenticado
 * y si posee alguno de los roles requeridos. En caso contrario, redirige al login o a la página correspondiente a su rol.
 * 
 * @component
 * @param {ProtectedRouteProps} props - Propiedades del componente.
 * @returns {JSX.Element} El contenido protegido o un redireccionamiento.
 */
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
