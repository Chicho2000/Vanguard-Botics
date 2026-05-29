import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import Dock from "@/components/ui/Dock";
import type { DockItemData } from "@/components/ui/Dock";
import VanguardCarIcon from "@/components/ui/VanguardCarIcon";

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

// Chart data will come from API — no mock data
const chartData: { time: string; ocupacion: number; recaudacion: number }[] = [];

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
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<RecentSession[]>([]);
  const [floors, setFloors] = useState<FloorOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("admin-active");
    return () => {
      document.documentElement.classList.remove("admin-active");
    };
  }, []);

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

  // Dock items for quick access
  const dockItems: DockItemData[] = [
    { icon: <LayoutDashboard size={18} className="text-[#00f0ff]" />, label: 'Dashboard', onClick: () => navigate("/admin") },
    { icon: <Map size={18} className="text-[#00f0ff]" />, label: 'Mapa', onClick: () => { } },
    { icon: <Users size={18} className="text-[#00f0ff]" />, label: 'Usuarios', onClick: () => { } },
    { icon: <Settings size={18} className="text-[#8892a4]" />, label: 'Config', onClick: () => navigate("/admin/configuracion") },
    { icon: <LogOut size={18} className="text-[#f43f5e]" />, label: 'Salir', onClick: logout },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
          <span className="text-xs font-semibold text-[#8892a4] uppercase tracking-[0.2em] animate-pulse font-mono">Cargando Telemetría...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 shadow-lg shadow-rose-500/5">
          <AlertCircle className="w-12 h-12 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <h2 className="text-lg font-bold text-[#e8ecf1]">Error de Conexión</h2>
          <p className="text-rose-400/80 text-sm leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="h-10 px-6 bg-card border border-border text-[#e8ecf1] hover:bg-secondary transition duration-300 font-semibold text-sm shadow-inner"
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
      color: "text-[#00f0ff] border-[#00f0ff]/20 shadow-[#00f0ff]/5",
      iconBg: "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/20"
    },
    {
      label: "Ocupación Actual",
      value: `${stats?.occupancyRate ?? 0}%`,
      icon: Car,
      color: "text-[#ff6b2c] border-[#ff6b2c]/20 shadow-[#ff6b2c]/5",
      iconBg: "bg-[#ff6b2c]/10 text-[#ff6b2c] border-[#ff6b2c]/20"
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
      color: "text-[#00f0ff] border-[#00f0ff]/20 shadow-[#00f0ff]/5",
      iconBg: "bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/20"
    },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#e8ecf1] flex overflow-hidden font-sans">

      {/* Sidebar Navigation */}
      <aside className="w-66 border-r border-border bg-background/80 backdrop-blur-md hidden md:flex flex-col z-20">
        <div className="h-16 flex items-center px-6 border-b border-border gap-3">
          <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/20 p-2 shadow-[0_0_8px_rgba(0,240,255,0.2)]">
            <VanguardCarIcon className="text-[#00f0ff] drop-shadow-[0_0_4px_rgba(0,240,255,0.4)]" size={20} />
          </div>
          <span className="font-black text-base uppercase tracking-[0.2em] bg-gradient-to-r from-[#00f0ff] to-cyan-300 bg-clip-text text-transparent">Vanguard</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          <button
            onClick={() => navigate("/admin")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-bold text-sm shadow-[0_0_12px_rgba(0,240,255,0.08)] text-left cursor-pointer"
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </button>
          <button
            onClick={() => { }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <Map className="w-4.5 h-4.5" />
            Mapa Cochera
          </button>
          <button
            onClick={() => { }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <Users className="w-4.5 h-4.5" />
            Usuarios
          </button>
          <button
            onClick={() => navigate("/admin/configuracion")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <Settings className="w-4.5 h-4.5" />
            Configuración
          </button>
        </nav>

        {/* User profile footer inside Sidebar */}
        <div className="p-4 border-t border-border bg-background/40">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="w-9 h-9 border border-border">
              <AvatarFallback className="bg-[#00f0ff]/10 text-[#00f0ff] font-bold text-xs uppercase font-mono">
                {user?.nombre ? user.nombre.slice(0, 2) : "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="overflow-hidden leading-tight">
              <p className="text-xs font-bold text-[#e8ecf1] truncate">{user?.nombre}</p>
              <p className="text-[10px] text-[#8892a4] truncate mt-0.5 font-mono">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full h-10 flex items-center justify-center gap-2 px-3 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-950/20 transition duration-300 text-xs font-bold"
          >
            <LogOut className="w-3.5 h-3.5" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">

        {/* Header bar */}
        <header className="h-16 flex items-center justify-between px-8 border-b border-border bg-background/60 backdrop-blur-md z-10">
          <div>
            <h1 className="text-lg font-black uppercase tracking-[0.15em] text-[#e8ecf1]">Centro de Comando</h1>
          </div>
          <div className="flex items-center gap-3.5">
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-auto p-8 pb-24 space-y-8">

          {/* KPI Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, i) => (
              <Card key={i} className={`border ${stat.color} bg-card/70 backdrop-blur-md shadow-2xl transition duration-300 hover:-translate-y-0.5`}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className={`p-3 border ${stat.iconBg}`}>
                    <stat.icon className="w-5 h-5 drop-shadow-[0_0_4px_currentColor]" />
                  </div>
                  <div className="leading-tight">
                    <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">{stat.label}</p>
                    <h3 className="text-2xl font-black font-mono text-[#e8ecf1] tracking-tight mt-1">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Chart Area */}
            <Card className="xl:col-span-2 border-border bg-card/60 backdrop-blur-md shadow-2xl">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-base font-extrabold text-[#e8ecf1]">Ocupación y Recaudación</CardTitle>
                <CardDescription className="text-xs text-[#8892a4] font-mono">Métricas analíticas del día en curso</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                {chartData.length > 0 ? (
                  <div className="h-[280px] w-full mt-4 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#141820" vertical={false} />
                        <XAxis dataKey="time" stroke="#8892a4" fontSize={11} className="font-mono" tickLine={false} axisLine={false} />
                        <YAxis stroke="#8892a4" fontSize={11} className="font-mono" tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a0c12', borderColor: '#141820', borderRadius: '0px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                          itemStyle={{ color: '#00f0ff', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                          labelStyle={{ color: '#8892a4', fontSize: '11px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="ocupacion"
                          stroke="#00f0ff"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorOcupacion)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] w-full mt-4 flex flex-col items-center justify-center text-[#8892a4] gap-3">
                    <ShieldCheck className="w-10 h-10 opacity-40" />
                    <span className="text-xs font-semibold font-mono uppercase tracking-widest">Sin datos de telemetría disponibles</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Garage Interactive Map Widget */}
            <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl flex flex-col">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-base font-extrabold text-[#e8ecf1]">Mapa Satelital</CardTitle>
                <CardDescription className="text-xs text-[#8892a4] font-mono">Visualización de cocheras en tiempo real</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-5 flex-1 overflow-y-auto">
                {floors.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-[#8892a4] text-xs gap-2 py-10">
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
                        <div key={floor.id} className="space-y-3 p-4 bg-background/40 border border-border">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-extrabold text-[#e8ecf1] uppercase tracking-[0.15em]">{floor.name}</span>
                            <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono text-[10px] tracking-wide">
                              {floor.occupiedSpots} / {floor.totalSpots} Slots
                            </Badge>
                          </div>

                          {/* Spots visualization */}
                          <div className="flex flex-wrap gap-1">
                            {spots.map((status, i) => (
                              <div
                                key={i}
                                title={status === 'occupied' ? 'Ocupado' : 'Disponible'}
                                className={`w-5 h-7 border flex items-center justify-center relative group transition duration-300 ${status === 'occupied'
                                    ? 'bg-[#ff6b2c]/15 border-[#ff6b2c]/35 shadow-[inset_0_0_4px_rgba(255,107,44,0.1)]'
                                    : 'bg-[#00f0ff]/10 border-[#00f0ff]/25 shadow-[inset_0_0_4px_rgba(0,240,255,0.1)]'
                                  }`}
                              >
                                {/* Mini inner indicator dot */}
                                <span className={`w-1 h-1 rounded-full ${status === 'occupied' ? 'bg-[#ff6b2c]' : 'bg-[#00f0ff]'
                                  }`} />
                              </div>
                            ))}
                            {floor.totalSpots > 40 && (
                              <div className="w-5 h-7 border border-border bg-card/40 flex items-center justify-center text-[9px] font-black text-[#8892a4]">
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

          {/* Recent Activities Table */}
          <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl">
            <CardHeader className="px-6 pt-5 pb-2">
              <CardTitle className="text-base font-extrabold text-[#e8ecf1]">Sesiones Activas & Recientes</CardTitle>
              <CardDescription className="text-xs text-[#8892a4] font-mono">Últimos movimientos detectados por las barreras</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {activity.length === 0 ? (
                <div className="text-center py-16">
                  <Car className="w-12 h-12 text-border mx-auto mb-3 animate-pulse" />
                  <p className="text-sm font-semibold text-[#8892a4]">Sin telemetría de barreras registrada.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader className="border-border bg-background/40 text-[#8892a4]">
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-4 font-mono">Vehículo</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-4 font-mono">Ubicación</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-4 font-mono">Tiempo</TableHead>
                      <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-4 text-right font-mono">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-border">
                    {activity.map((entry) => (
                      <TableRow key={entry.id} className="border-border hover:bg-card/60 transition duration-200">
                        {/* Plate number */}
                        <TableCell className="py-4 font-mono">
                          <div className="flex items-center gap-3">
                            <div className="px-2.5 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] font-bold text-sm tracking-[0.15em] shadow-sm">
                              {entry.plate}
                            </div>
                            {entry.brand && (
                              <div className="leading-tight">
                                <span className="block text-xs font-bold text-[#e8ecf1]">{entry.brand}</span>
                                <span className="text-[10px] text-[#8892a4]">{entry.model}</span>
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Location */}
                        <TableCell className="py-4 text-[#e8ecf1] text-xs font-semibold">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[#8892a4]">{entry.floor}</span>
                            <span className="text-border">•</span>
                            <span className="text-[#00f0ff] font-bold font-mono">{entry.spot}</span>
                          </div>
                        </TableCell>

                        {/* Time ago */}
                        <TableCell className="py-4 text-[#8892a4] text-xs font-mono">
                          {formatTimeAgo(entry.entryAt)}
                        </TableCell>

                        {/* Status Badge */}
                        <TableCell className="py-4 text-right">
                          <Badge
                            className={`font-semibold text-[10px] uppercase font-mono tracking-[0.15em] px-2.5 py-0.5 border ${entry.status === "ACTIVE"
                                ? "bg-[#ff6b2c]/10 text-[#ff6b2c] border-[#ff6b2c]/25 shadow-[0_0_8px_rgba(255,107,44,0.06)]"
                                : "bg-secondary text-muted-foreground border-border"
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

        {/* Floating Dock â€” Quick Actions */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center z-30 pointer-events-none">
          <div className="pointer-events-auto">
            <Dock
              items={dockItems}
              panelHeight={68}
              baseItemSize={46}
              magnification={72}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
