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
    <nav className="bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#00f0ff] to-[#0089C5] p-2">
            <span className="text-white font-bold text-lg font-mono">VB</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wider uppercase">Vanguard Botics</h1>
            <p className="text-[#8892a4] text-xs font-mono uppercase tracking-[0.15em]">Cochera Inteligente</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
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
