import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import { 
  Users, User, Car, Layers, CreditCard, Loader2, AlertCircle, 
  LayoutDashboard, Map, Settings, LogOut 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

// Mock data for the chart since we don't have historical data API yet
const mockChartData = [
  { time: '08:00', ocupacion: 10, recaudacion: 500 },
  { time: '10:00', ocupacion: 25, recaudacion: 1500 },
  { time: '12:00', ocupacion: 60, recaudacion: 4000 },
  { time: '14:00', ocupacion: 85, recaudacion: 7500 },
  { time: '16:00', ocupacion: 70, recaudacion: 9000 },
  { time: '18:00', ocupacion: 95, recaudacion: 12000 },
  { time: '20:00', ocupacion: 40, recaudacion: 13500 },
];

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
  const { user, logout } = useAuth();
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-destructive" />
        <p className="text-destructive/80 font-medium">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const statCards = [
    { label: "Espacios Totales", value: stats?.totalSpots ?? 0, icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Ocupación Actual", value: `${stats?.occupancyRate ?? 0}%`, icon: Car, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Usuarios Activos", value: stats?.totalUsers ?? 0, icon: Users, color: "text-violet-500", bg: "bg-violet-500/10" },
    { label: "Ingresos del Día", value: `$${(stats?.todayRevenue ?? 0).toLocaleString()}`, icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Car className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Vanguard</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <a href="#" className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-md font-medium">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary/50 rounded-md font-medium transition-colors">
            <Map className="w-5 h-5" />
            Mapa Cochera
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary/50 rounded-md font-medium transition-colors">
            <Users className="w-5 h-5" />
            Usuarios
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-secondary/50 rounded-md font-medium transition-colors">
            <Settings className="w-5 h-5" />
            Configuración
          </a>
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
              <User className="w-4 h-4 text-secondary-foreground" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-md transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-card/50 backdrop-blur-md">
          <div>
            <h1 className="text-xl font-bold">Centro de Comando</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-sm font-medium text-muted-foreground">Sistema En Línea</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, i) => (
              <Card key={i} className="border-border bg-card">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${stat.bg}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Chart Section */}
            <Card className="xl:col-span-2 border-border bg-card">
              <CardHeader>
                <CardTitle>Ocupación y Recaudación</CardTitle>
                <CardDescription>Tendencia del día actual</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f1f38', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#f8fafc' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ocupacion" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorOcupacion)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Garage Map */}
            <Card className="border-border bg-card flex flex-col">
              <CardHeader>
                <CardTitle>Mapa de Cochera</CardTitle>
                <CardDescription>Visualización de espacios en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                {floors.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                    No hay pisos configurados.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {floors.map(floor => {
                      // Generate dummy grid to visualize spots based on totalSpots
                      // For a realistic visual, we fill an array. Some are occupied (red), some free (green)
                      const spots = Array.from({ length: Math.min(floor.totalSpots, 40) }, (_, i) => {
                        return i < floor.occupiedSpots ? 'occupied' : 'free';
                      });

                      return (
                        <div key={floor.id} className="space-y-2">
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-foreground">{floor.name}</span>
                            <span className="text-muted-foreground">{floor.occupiedSpots}/{floor.totalSpots}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {spots.map((status, i) => (
                              <div 
                                key={i}
                                title={status === 'occupied' ? 'Ocupado' : 'Libre'}
                                className={`w-6 h-8 rounded-sm border ${
                                  status === 'occupied' 
                                    ? 'bg-red-500/20 border-red-500/50' 
                                    : 'bg-emerald-500/20 border-emerald-500/50'
                                }`}
                              />
                            ))}
                            {floor.totalSpots > 40 && (
                              <div className="w-6 h-8 flex items-center justify-center text-xs text-muted-foreground">
                                +{floor.totalSpots - 40}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle>Sesiones Recientes</CardTitle>
              <CardDescription>Últimos movimientos registrados en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {activity.length === 0 ? (
                <div className="text-center py-12">
                  <Car className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay actividad registrada aún.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Vehículo</th>
                        <th className="px-4 py-3">Ubicación</th>
                        <th className="px-4 py-3">Ingreso</th>
                        <th className="px-4 py-3 text-right rounded-tr-lg">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {activity.map((entry) => (
                        <tr key={entry.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-foreground">
                            {entry.plate}
                            {entry.brand && <span className="block text-xs font-sans text-muted-foreground mt-0.5">{entry.brand} {entry.model}</span>}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {entry.floor} <span className="mx-1">•</span> {entry.spot}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {formatTimeAgo(entry.entryAt)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                              entry.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                                : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                            }`}>
                              {entry.status === "ACTIVE" ? "Activo" : "Completado"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};
