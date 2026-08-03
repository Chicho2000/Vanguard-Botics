/**
 * @fileoverview Componente de barra de navegación principal para Vanguard Botics.
 * @version 1.0.0
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";
import VanguardCarIcon from "./ui/VanguardCarIcon";

/**
 * Componente Navbar que muestra el título de la aplicación, el usuario autenticado
 * con su respectivo rol y el botón para cerrar la sesión actual.
 * 
 * @component
 * @returns {JSX.Element} La barra de navegación superior.
 */
export const Navbar: React.FC = () => {
  const { logout, user, sessionExpiresAt } = useAuth();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);
  const remainingMinutes = sessionExpiresAt ? Math.max(0, Math.ceil((sessionExpiresAt - now) / 60_000)) : null;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const rolLabels: Record<string, string> = {
    ADMIN: "Administrador",
    CLIENTE: "Cliente",
    INVITADO: "Invitado",
  };

  return (
    <nav className="bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/20 p-2 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <VanguardCarIcon className="text-[#00f0ff] drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]" size={20} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wider uppercase">Vanguard Botics</h1>
            <p className="text-[#8892a4] text-xs font-mono uppercase tracking-[0.15em]">Cochera Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {remainingMinutes !== null && <span className="hidden sm:inline text-[10px] font-mono text-[#8892a4]">Sesión: {remainingMinutes} min</span>}
          <div className="flex items-center gap-2 bg-secondary/60 px-3 py-2 border border-border">
            <User className="w-4 h-4 text-[#00f0ff]" />
            <div className="text-sm">
              <span className="text-white font-medium">{user?.nombre}</span>
              <span className="text-[#8892a4] ml-2 text-xs font-mono">{rolLabels[user?.rol || ""] || user?.rol}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white text-sm font-medium border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};
