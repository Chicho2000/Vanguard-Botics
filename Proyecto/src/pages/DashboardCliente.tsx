import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Car, Clock, CreditCard, MapPin } from "lucide-react";

export const DashboardCliente: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">
            Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.nombre}</span>
          </h2>
          <p className="text-slate-400 mt-1">Gestioná tus vehículos y sesiones de estacionamiento</p>
        </div>

        {/* My Vehicles */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-cyan-400" />
            Mis Vehículos
          </h3>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tenés vehículos registrados aún.</p>
              <button className="mt-4 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-blue-500/20">
                + Agregar Vehículo
              </button>
            </div>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Sesiones Activas
          </h3>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No hay sesiones activas en este momento.</p>
            </div>
          </div>
        </div>

        {/* Subscriptions */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-400" />
            Mis Abonos
          </h3>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No tenés abonos activos.</p>
              <button className="mt-4 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium rounded-xl hover:from-violet-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/20">
                Ver Planes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
