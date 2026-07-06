import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import {
  Users, Layers, CreditCard, Loader2, AlertCircle,
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
import { getErrorMessage } from "../lib/validation";

interface RecentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  vehicles: { licensePlate: string; brand: string | null; model: string | null }[];
  subscription: { type: string; validUntil: string } | null;
  assignedSpot: string | null;
}

interface ActiveReservation {
  spotId: number;
  label: string;
  floorName: string;
  userId: number;
  userName: string;
  userEmail: string;
  licensePlate: string | null;
  subscriptionType: string | null;
  subscriptionValidUntil: string | null;
}

interface Stats {
  totalSpots: number;
  occupancyRate: number;
  totalUsers: number;
  todayRevenue: number;
  recentUsers?: RecentUser[];
  activeReservations?: ActiveReservation[];
  chartData?: { time: string; ocupacion: number; recaudacion: number }[];
  registrationSummary?: {
    total: number;
    clients: number;
    admins: number;
    guests: number;
    registeredToday: number;
    registeredThisWeek: number;
  };
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
  isGuest: boolean;
}





// Chart data is retrieved from stats API

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summaryTab, setSummaryTab] = useState<"registros" | "reservas">("registros");

  useEffect(() => {
    document.documentElement.classList.add("admin-active");
    return () => {
      document.documentElement.classList.remove("admin-active");
    };
  }, []);

  const loadDashboard = useCallback(async (initial = false) => {
      try {
        if (initial) setLoading(true);
        setError("");
        const [statsData, activityData] = await Promise.all([
          adminService.getStats(),
          adminService.getRecentActivity(),
        ]);
        setStats(statsData);
        setActivity(activityData);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Error al cargar el dashboard"));
      } finally {
        if (initial) setLoading(false);
      }
  }, []);

  useEffect(() => {
    void loadDashboard(true);
    const interval = window.setInterval(() => void loadDashboard(false), 10_000);
    const refresh = () => void loadDashboard(false);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [loadDashboard]);

  // Dock items for quick access
  const dockItems: DockItemData[] = [
    { icon: <LayoutDashboard size={18} className="text-[#00f0ff]" />, label: 'Dashboard', onClick: () => navigate("/admin") },
    { icon: <Map size={18} className="text-[#00f0ff]" />, label: 'Mapa', onClick: () => navigate("/admin/mapa") },
    { icon: <Users size={18} className="text-[#00f0ff]" />, label: 'Usuarios', onClick: () => navigate("/admin/usuarios") },
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
      icon: VanguardCarIcon,
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
            onClick={() => navigate("/admin/mapa")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <Map className="w-4.5 h-4.5" />
            Mapa Cochera
          </button>
          <button
            onClick={() => navigate("/admin/usuarios")}
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

          <div className="grid grid-cols-1 gap-8">
            {/* Chart Area */}
            <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl w-full">
              <CardHeader className="px-6 pt-5 pb-2">
                <CardTitle className="text-base font-extrabold text-[#e8ecf1]">Ocupación y Recaudación</CardTitle>
                <CardDescription className="text-xs text-[#8892a4] font-mono">Métricas analíticas del día en curso</CardDescription>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                {stats?.chartData && stats.chartData.length > 0 ? (
                  <div className="h-[280px] w-full mt-4 select-none">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.chartData} margin={{ top: 10, right: -5, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorOcupacion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorRecaudacion" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff6b2c" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#ff6b2c" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#141820" vertical={false} />
                        <XAxis dataKey="time" stroke="#8892a4" fontSize={11} className="font-mono" tickLine={false} axisLine={false} />
                        <YAxis yAxisId="left" stroke="#00f0ff" fontSize={11} className="font-mono" tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#ff6b2c" fontSize={11} className="font-mono" tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0a0c12', borderColor: '#141820', borderRadius: '0px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)' }}
                          itemStyle={{ fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                          labelStyle={{ color: '#8892a4', fontSize: '11px', fontWeight: 'bold', fontFamily: 'JetBrains Mono' }}
                          formatter={(value, name) => {
                            if (name === "ocupacion") return [`${value}%`, "Ocupación"];
                            if (name === "recaudacion") return [`$${Number(value).toLocaleString()}`, "Recaudación acumulada"];
                            return [value, name];
                          }}
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="ocupacion"
                          name="ocupacion"
                          stroke="#00f0ff"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorOcupacion)"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="recaudacion"
                          name="recaudacion"
                          stroke="#ff6b2c"
                          strokeWidth={2.5}
                          fillOpacity={1}
                          fill="url(#colorRecaudacion)"
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
          </div>

          {/* Summary of Registrations & Reservations */}
          <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl">
            <CardHeader className="px-6 pt-5 pb-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-base font-extrabold text-[#e8ecf1]">Resumen del Sistema</CardTitle>
                <CardDescription className="text-xs text-[#8892a4] font-mono">Consolidado de altas y reservas de cocheras</CardDescription>
              </div>
              {/* Tab Selector */}
              <div className="flex border border-border p-1 bg-background/40">
                <button
                  onClick={() => setSummaryTab("registros")}
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    summaryTab === "registros"
                      ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20"
                      : "text-[#8892a4] hover:text-[#e8ecf1]"
                  }`}
                >
                  Registros Recientes
                </button>
                <button
                  onClick={() => setSummaryTab("reservas")}
                  className={`px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    summaryTab === "reservas"
                      ? "bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20"
                      : "text-[#8892a4] hover:text-[#e8ecf1]"
                  }`}
                >
                  Cocheras Asignadas ({stats?.activeReservations?.length ?? 0})
                </button>
              </div>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {stats?.registrationSummary && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  {[
                    ["Clientes", stats.registrationSummary.clients],
                    ["Hoy", stats.registrationSummary.registeredToday],
                    ["Últimos 7 días", stats.registrationSummary.registeredThisWeek],
                    ["Total cuentas", stats.registrationSummary.total],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="p-3 bg-background/40 border border-border/60">
                      <p className="text-[9px] uppercase tracking-wider text-[#8892a4] font-mono">{label}</p>
                      <p className="text-xl font-black text-[#00f0ff] mt-1">{value}</p>
                    </div>
                  ))}
                </div>
              )}
              {summaryTab === "registros" ? (
                /* Recent Registrations Table */
                !stats?.recentUsers || stats.recentUsers.length === 0 ? (
                  <div className="text-center py-12 text-[#8892a4] text-xs font-mono">
                    No se registran usuarios recientes.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="border-border bg-background/40 text-[#8892a4]">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Usuario</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Rol</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Vehículo</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Abono</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Cochera</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 text-right font-mono">Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                      {stats.recentUsers.map((rUser) => (
                        <TableRow key={rUser.id} className="border-border hover:bg-card/60 transition duration-200 text-xs">
                          {/* User details */}
                          <TableCell className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-8 h-8 border border-border">
                                <AvatarFallback className="bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase font-mono">
                                  {rUser.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="leading-tight">
                                <p className="font-bold text-[#e8ecf1]">{rUser.name}</p>
                                <p className="text-[10px] text-[#8892a4] font-mono mt-0.5">{rUser.email}</p>
                              </div>
                            </div>
                          </TableCell>

                          {/* Role */}
                          <TableCell className="py-3 font-mono">
                            <Badge className={`text-[9px] uppercase tracking-wider font-bold rounded-none px-1.5 py-0.5 border ${
                              rUser.role === "ADMIN"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/25"
                                : rUser.role === "CLIENTE"
                                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                            }`}>
                              {rUser.role}
                            </Badge>
                          </TableCell>

                          {/* Vehicle Details */}
                          <TableCell className="py-3 font-mono">
                            {rUser.vehicles && rUser.vehicles.length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                <span className="px-1.5 py-0.5 bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] font-bold text-[10px] tracking-wider w-fit">
                                  {rUser.vehicles[0].licensePlate}
                                </span>
                                {rUser.vehicles[0].brand && (
                                  <span className="text-[9px] text-[#8892a4]">
                                    {rUser.vehicles[0].brand}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-[#8892a4] italic">Sin auto</span>
                            )}
                          </TableCell>

                          {/* Active Subscription */}
                          <TableCell className="py-3 font-mono">
                            {rUser.subscription ? (
                              <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] tracking-wide font-bold rounded-none">
                                {rUser.subscription.type}
                              </Badge>
                            ) : (
                              <span className="text-[#8892a4]">Ninguno</span>
                            )}
                          </TableCell>

                          {/* Selected parking spot */}
                          <TableCell className="py-3 font-mono">
                            {rUser.assignedSpot ? (
                              <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-[10px] tracking-wider">
                                {rUser.assignedSpot}
                              </span>
                            ) : (
                              <span className="text-[#8892a4]">—</span>
                            )}
                          </TableCell>

                          {/* Registration Date */}
                          <TableCell className="py-3 text-right font-mono text-[#8892a4]">
                            {formatTimeAgo(rUser.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              ) : (
                /* Cocheras Asignadas / Reservas Table */
                !stats?.activeReservations || stats.activeReservations.length === 0 ? (
                  <div className="text-center py-12 text-[#8892a4] text-xs font-mono">
                    No hay cocheras reservadas o asignadas en este momento.
                  </div>
                ) : (
                  <Table>
                    <TableHeader className="border-border bg-background/40 text-[#8892a4]">
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Cochera</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Piso</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Asignado A</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 font-mono">Vehículo</TableHead>
                        <TableHead className="font-bold text-xs uppercase tracking-[0.15em] py-3.5 text-right font-mono">Abono Titular</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border">
                      {stats.activeReservations.map((res) => (
                        <TableRow key={res.spotId} className="border-border hover:bg-card/60 transition duration-200 text-xs">
                          {/* Spot Label */}
                          <TableCell className="py-3 font-mono">
                            <span className="px-2 py-1 bg-purple-500/10 border border-purple-500/25 text-purple-400 font-black text-xs tracking-wider">
                              {res.label}
                            </span>
                          </TableCell>

                          {/* Floor Name */}
                          <TableCell className="py-3 text-[#e8ecf1] font-semibold">
                            {res.floorName}
                          </TableCell>

                          {/* Assigned User */}
                          <TableCell className="py-3">
                            <div className="leading-tight">
                              <p className="font-bold text-[#e8ecf1]">{res.userName || "—"}</p>
                              <p className="text-[10px] text-[#8892a4] font-mono mt-0.5">{res.userEmail || "—"}</p>
                            </div>
                          </TableCell>

                          {/* Vehicle Plate */}
                          <TableCell className="py-3 font-mono">
                            {res.licensePlate ? (
                              <span className="px-1.5 py-0.5 bg-[#00f0ff]/5 border border-[#00f0ff]/15 text-[#00f0ff] font-bold text-[10px] tracking-wider">
                                {res.licensePlate}
                              </span>
                            ) : (
                              <span className="text-[#8892a4] italic">Sin auto</span>
                            )}
                          </TableCell>

                          {/* Subscription Valid Until */}
                          <TableCell className="py-3 text-right font-mono">
                            {res.subscriptionType ? (
                              <div className="flex flex-col items-end gap-0.5">
                                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] tracking-wide font-bold rounded-none">
                                  {res.subscriptionType}
                                </Badge>
                                {res.subscriptionValidUntil && (
                                  <span className="text-[9px] text-[#8892a4]">
                                    Vence: {new Date(res.subscriptionValidUntil).toLocaleDateString("es-AR")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-rose-400 font-semibold uppercase text-[9px] tracking-wide">Sin Abono Activo</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )
              )}
            </CardContent>
          </Card>

          {/* Recent Activities Table */}
          <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl">
            <CardHeader className="px-6 pt-5 pb-2">
              <CardTitle className="text-base font-extrabold text-[#e8ecf1]">Historial de Estacionamientos</CardTitle>
              <CardDescription className="text-xs text-[#8892a4] font-mono">Hasta 100 ingresos y salidas, incluidos clientes e invitados</CardDescription>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              {activity.length === 0 ? (
                <div className="text-center py-16">
                  <VanguardCarIcon className="text-border mx-auto mb-3 animate-pulse" size={48} />
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
                            {entry.isGuest && <Badge className="bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[9px] rounded-none">INVITADO</Badge>}
                            {entry.brand && (
                              <div className="leading-tight">
                                <span className="block text-xs font-bold text-[#e8ecf1]">{entry.brand}</span>
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
