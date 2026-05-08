import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Car, Clock, MapPin, Timer } from "lucide-react";

export const DashboardInvitado: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Patente Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-slate-800/60 backdrop-blur-sm border border-slate-700/50 rounded-2xl px-6 py-4 mb-4">
            <Car className="w-8 h-8 text-cyan-400" />
            <span className="text-3xl font-mono font-bold text-white tracking-widest">
              {user?.patente || "---"}
            </span>
          </div>
          <p className="text-slate-400">Acceso rápido por patente — sin registro necesario</p>
        </div>

        {/* Active Session Card */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-500/20 p-2.5 rounded-xl">
              <Clock className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Estado de Estacionamiento</h3>
          </div>

          <div className="text-center py-6">
            <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">No hay sesión activa para esta patente.</p>
            <p className="text-slate-500 text-sm mt-2">
              Cuando ingreses a la cochera, tu sesión aparecerá aquí automáticamente.
            </p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <Timer className="w-6 h-6 text-cyan-400 mb-3" />
            <h4 className="text-white font-medium mb-1">Tarifa por Hora</h4>
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">$500</p>
            <p className="text-slate-500 text-xs mt-1">Se cobra por minuto de estadía</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
            <Car className="w-6 h-6 text-violet-400 mb-3" />
            <h4 className="text-white font-medium mb-1">¿Querés un abono?</h4>
            <p className="text-slate-400 text-sm">Registrate como usuario para acceder a planes con descuento.</p>
            <button className="mt-3 text-cyan-400 text-sm font-medium hover:text-cyan-300 transition-colors">
              Crear cuenta →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
