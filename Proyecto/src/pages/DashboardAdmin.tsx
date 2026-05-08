import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import { Users, Car, Layers, CreditCard, Clock, Loader2, AlertCircle } from "lucide-react";

interface Stats {
  totalUsers: number;
  totalVehicles: number;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  activeSessions: number;
  occupancyRate: number;
  todayRevenue: number;
}

interface RecentSession {
  id: number;
  plate: string;
  brand: string | null;
  model: string | null;
  spot: string;
  floor: string;
  entryAt: string;
  exitAt: string | null;
  status: string;
  amount: number | null;
}

interface FloorOverview {
  id: number;
  name: string;
  level: number;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${Math.floor(hours / 24)}d`;
}

export const DashboardAdmin: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<RecentSession[]>([]);
  const [floors, setFloors] = useState<FloorOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError("");
        const [statsData, activityData, floorsData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivity(),
          adminService.getFloors(),
        ]);
        setStats(statsData);
        setActivity(activityData);
        setFloors(floorsData);
      } catch (err: any) {
        setError(err.message || "Error al cargar el dashboard");
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Espacios Totales", value: stats?.totalSpots ?? 0, icon: Layers, color: "from-cyan-500 to-blue-600" },
    { label: "Ocupados", value: stats?.occupiedSpots ?? 0, icon: Car, color: "from-orange-500 to-red-500", sub: `${stats?.occupancyRate ?? 0}% ocupación` },
    { label: "Usuarios", value: stats?.totalUsers ?? 0, icon: Users, color: "from-violet-500 to-purple-600" },
    { label: "Ingresos Hoy", value: `$${(stats?.todayRevenue ?? 0).toLocaleString()}`, icon: CreditCard, color: "from-emerald-500 to-green-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white">
            Bienvenido, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">{user?.nombre}</span>
          </h2>
          <p className="text-slate-400 mt-1">Panel de administración — Datos en tiempo real</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((card) => (
            <div key={card.label} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-5 hover:border-slate-600/50 transition-all duration-300 group">
              <div className="flex items-center justify-between mb-3">
                <div className={`bg-gradient-to-r ${card.color} p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{card.value}</p>
              <p className="text-slate-400 text-sm mt-1">{card.label}</p>
              {"sub" in card && card.sub && <p className="text-slate-500 text-xs mt-0.5">{card.sub}</p>}
            </div>
          ))}
        </div>

        {/* Floors Overview */}
        {floors.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">Pisos</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {floors.map((floor) => {
                const pct = floor.totalSpots > 0 ? Math.round((floor.occupiedSpots / floor.totalSpots) * 100) : 0;
                return (
                  <div key={floor.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{floor.name}</h4>
                      <span className="text-xs text-slate-400">Nivel {floor.level}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-orange-400" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">{floor.occupiedSpots}/{floor.totalSpots} ocupados</span>
                      <span className="text-emerald-400">{floor.availableSpots} libres</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            Actividad Reciente
          </h3>
          {activity.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No hay actividad registrada aún.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activity.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-3 border-b border-slate-700/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${entry.status === "ACTIVE" ? "bg-emerald-500/20" : "bg-slate-700/60"}`}>
                      <Car className={`w-4 h-4 ${entry.status === "ACTIVE" ? "text-emerald-400" : "text-slate-400"}`} />
                    </div>
                    <div>
                      <span className="text-white font-mono text-sm font-medium">{entry.plate}</span>
                      {entry.brand && <span className="text-slate-500 text-xs ml-2">{entry.brand} {entry.model}</span>}
                      <p className="text-slate-400 text-xs">
                        {entry.status === "ACTIVE" ? "Estacionado en" : "Salió de"} {entry.floor} — {entry.spot}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded-lg ${entry.status === "ACTIVE" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-700/60 text-slate-400"}`}>
                      {entry.status === "ACTIVE" ? "Activo" : "Completado"}
                    </span>
                    <p className="text-slate-500 text-xs mt-1">{formatTimeAgo(entry.entryAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
