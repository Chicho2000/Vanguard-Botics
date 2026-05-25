import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut, User } from "lucide-react";

export const Navbar: React.FC = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
    <nav className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-2 rounded-xl">
            <span className="text-white font-bold text-lg">VB</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">Vanguard Botics</h1>
            <p className="text-slate-400 text-xs">Cochera Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-700/40 px-3 py-2 rounded-xl">
            <User className="w-4 h-4 text-cyan-400" />
            <div className="text-sm">
              <span className="text-white font-medium">{user?.nombre}</span>
              <span className="text-slate-400 ml-2 text-xs">{rolLabels[user?.rol || ""] || user?.rol}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-300 hover:text-white text-sm font-medium rounded-xl border border-red-500/30 hover:border-red-500/50 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </div>
    </nav>
  );
};
