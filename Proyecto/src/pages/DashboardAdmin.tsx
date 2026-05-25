import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import { 
  Users, Car, Layers, CreditCard, Loader2, AlertCircle, 
  LayoutDashboard, Map, Settings, LogOut, ShieldCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stats {
  totalSpots: number;
  occupancyRate: number;
  totalUsers: number;
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
      <div className="min-h-screen bg-[#080c14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-sky-400 animate-spin drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest animate-pulse">Cargando Telemetría...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#080c14] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-full shadow-lg shadow-rose-500/5">
          <AlertCircle className="w-12 h-12 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-slate-200">Error de Conexión</h2>
          <p className="text-rose-400/80 text-sm leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="h-10 px-6 bg-slate-900 border border-slate-800 text-slate-200 rounded-xl hover:bg-slate-800 transition duration-300 font-semibold text-sm shadow-inner"
        >
          Reintentar Enlace
        </button>
      </div>
    );
  }

  const statCards = [
    { 
      label: "Espacios Totales", 
      value: stats?.totalSpots ?? 0, 
      icon: Layers, 
      color: "text-sky-400 border-sky-500/20 shadow-sky-500/5", 
      iconBg: "bg-sky-500/10 text-sky-400 border-sky-500/20" 
    },
    { 
      label: "Ocupación Actual", 
      value: `${stats?.occupancyRate ?? 0}%`, 
      icon: Car, 
      color: "text-rose-400 border-rose-500/20 shadow-rose-500/5", 
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20" 
    },
    { 
      label: "Usuarios Activos", 
      value: stats?.totalUsers ?? 0, 
      icon: Users, 
      color: "text-indigo-400 border-indigo-500/20 shadow-indigo-500/5", 
      iconBg: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" 
    },
    { 
      label: "Ingresos del Día", 
      value: `$${(stats?.todayRevenue ?? 0).toLocaleString()}`, 
      icon: CreditCard, 
      color: "text-emerald-400 border-emerald-500/20 shadow-emerald-500/5", 
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
    },
  ];

  return (
    <div className="min-h-screen bg-[#080c14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.08),rgba(255,255,255,0))] text-[#f1f5f9] flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation (Sleek Glassmorphic Floating Panel) */}
      <aside className="w-66 border-r border-slate-900 bg-slate-950/40 backdrop-blur-md hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-900 gap-3">
          <div className="bg-sky-500/10 border border-sky-500/20 p-2 rounded-xl shadow-[0_0_8px_rgba(56,189,248,0.2)]">
            <Car className="w-5 h-5 text-sky-400 drop-shadow-[0_0_4px_rgba(56,189,248,0.4)]" />
          </div>
          <span className="font-black text-base uppercase tracking-[0.18em] bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">Vanguard</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-xl font-bold text-sm shadow-[0_0_12px_rgba(56,189,248,0.08)]">
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </a>
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-xl font-semibold text-sm transition duration-200">
            <Map className="w-4.5 h-4.5" />
            Mapa Cochera
          </a>
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-xl font-semibold text-sm transition duration-200">
            <Users className="w-4.5 h-4.5" />
            Usuarios
          </a>
          <a href="#" className="flex items-center gap-3 px-3.5 py-2.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 rounded-xl font-semibold text-sm transition duration-200">
            <Settings className="w-4.5 h-4.5" />
            Configuración
          </a>
        </nav>

        {/* User profile footer inside Sidebar */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="w-9 h-9 border border-slate-800">
              <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold text-xs uppercase font-mono">
                {user?.nombre ? user.nombre.slice(0, 2) : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.nombre}</p>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full h-10 flex items-center justify-center gap-2 px-3 rounded-xl border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-950/20 transition duration-300 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10">
        
        {/* Header bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-slate-900 bg-slate-950/30 backdrop-blur-md z-10">
          <div>
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-200">Centro de Comando</h1>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Sistema En Línea</span>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-auto p-8 space-y-8">
          
          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <Card key={i} className={`border ${stat.color} bg-[#0f172a]/55 backdrop-blur-md shadow-2xl transition duration-300 hover:-translate-y-0.5`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 rounded-xl border ${stat.iconBg}`}>
                    <stat.icon className="w-5 h-5 drop-shadow-[0_0_4px_currentColor]" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <h3 className="text-2xl font-black font-mono text-slate-100 tracking-tight mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Chart Area */}
            <Card className="xl:col-span-2 border-slate-900 bg-[#0f172a]/45 backdrop-blur-md shadow-2xl">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-base font-extrabold text-slate-200">Ocupación y Recaudación</CardTitle>
                <CardDescription className="text-xs text-slate-500">Métricas analíticas del día en curso</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="h-[280px] w-full mt-4 select-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.35}/>
                          <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} className="font-mono" tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={11} className="font-mono" tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                        itemStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
                        labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="ocupacion" 
                        stroke="#38bdf8" 
                        strokeWidth={2.5}
                        fillOpacity={1} 
                        fill="url(#colorOcupacion)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Garage Interactive Map Widget */}
            <Card className="border-slate-900 bg-[#0f172a]/45 backdrop-blur-md shadow-2xl flex flex-col">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-base font-extrabold text-slate-200">Mapa Satelital</CardTitle>
                <CardDescription className="text-xs text-slate-500">Visualización de cocheras en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-5 flex-1 overflow-y-auto">
                {floors.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs gap-2 py-10">
                    <ShieldCheck className="w-8 h-8 opacity-45" />
                    <span>No hay plantas configuradas.</span>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {floors.map(floor => {
                      const spots = Array.from({ length: Math.min(floor.totalSpots, 40) }, (_, i) => {
                        return i < floor.occupiedSpots ? 'occupied' : 'free';
                      });

                      return (
                        <div key={floor.id} className="space-y-3 p-4 bg-slate-950/20 border border-slate-900 rounded-xl">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-slate-300 uppercase tracking-wider">{floor.name}</span>
                            <Badge className="bg-sky-500/10 text-sky-400 border border-sky-500/20 font-mono text-[10px] tracking-wide">
                              {floor.occupiedSpots} / {floor.totalSpots} Slots
                            </Badge>
                          </div>
                          
                          {/* Spots visualization */}
                          <div className="flex flex-wrap gap-1">
                            {spots.map((status, i) => (
                              <div 
                                key={i}
                                title={status === 'occupied' ? 'Ocupado' : 'Disponible'}
                                className={`w-5 h-7 rounded-md border flex items-center justify-center relative group transition duration-300 ${
                                  status === 'occupied' 
                                    ? 'bg-rose-500/15 border-rose-500/35 shadow-[inset_0_0_4px_rgba(244,63,94,0.1)]' 
                                    : 'bg-emerald-500/15 border-emerald-500/35 shadow-[inset_0_0_4px_rgba(16,185,129,0.1)]'
                                }`}
                              >
                                {/* Mini inner indicator dot */}
                                <span className={`w-1 h-1 rounded-full ${
                                  status === 'occupied' ? 'bg-rose-400' : 'bg-emerald-400'
                                }`} />
                              </div>
                            ))}
                            {floor.totalSpots > 40 && (
                              <div className="w-5 h-7 rounded-md border border-slate-800 bg-slate-900/40 flex items-center justify-center text-[9px] font-black text-slate-500">
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

          {/* Recent Activities Shadcn Table Widget */}
          <Card className="border-slate-900 bg-[#0f172a]/45 backdrop-blur-md shadow-2xl">
            <CardHeader className="px-6 pt-5 pb-2">
              <CardTitle className="text-base font-extrabold text-slate-200">Sesiones Activas & Recientes</CardTitle>
              <CardDescription className="text-xs text-slate-500">Últimos movimientos detectados por las barreras</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {activity.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="w-12 h-12 text-slate-700 mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-slate-500">Sin telemetría de barreras registrada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="border-slate-800 bg-slate-950/20 text-slate-400">
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Vehículo</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Ubicación</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4">Tiempo Transcurrido</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-wider py-4 text-right">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-slate-900">
                    {activity.map((entry) => (
                      <TableRow key={entry.id} className="border-slate-900 hover:bg-slate-900/30 transition duration-200">
                        {/* Plate number */}
                        <TableCell className="py-4 font-mono">
                          <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400 font-bold text-sm tracking-widest shadow-sm">
                              {entry.plate}
                            </div>
                            {entry.brand && (
                              <div className="leading-tight">
                                <span className="block text-xs font-bold text-slate-300">{entry.brand}</span>
                                <span className="text-[10px] text-slate-500">{entry.model}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        
                        {/* Location */}
                        <TableCell className="py-4 text-slate-300 text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400">{entry.floor}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-sky-400 font-bold font-mono">{entry.spot}</span>
                          </div>
                        </TableCell>
                        
                        {/* Time ago */}
                        <TableCell className="py-4 text-slate-400 text-xs font-mono">
                          {formatTimeAgo(entry.entryAt)}
                        </TableCell>
                        
                        {/* Status Badge */}
                        <TableCell className="py-4 text-right">
                          <Badge 
                            className={`font-semibold text-[10px] uppercase font-mono tracking-wider px-2.5 py-0.5 border ${
                              entry.status === "ACTIVE" 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.06)]" 
                                : "bg-slate-800 text-slate-400 border-slate-700/50"
                            }`}
                          >
                            {entry.status === "ACTIVE" ? "Activo" : "Salida"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
};
