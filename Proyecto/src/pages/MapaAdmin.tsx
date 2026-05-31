import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import {
  Users, Car, Layers, CreditCard, Loader2, AlertCircle,
  LayoutDashboard, Map, Settings, LogOut
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Dock from "@/components/ui/Dock";
import type { DockItemData } from "@/components/ui/Dock";
import VanguardCarIcon from "@/components/ui/VanguardCarIcon";

interface FloorSpot {
  id: number;
  label: string;
  isOccupied: boolean;
  spotType: string;
  vehicle: {
    licensePlate: string;
    brand: string | null;
    model: string | null;
    color: string | null;
    entryAt: string;
  } | null;
}

interface FloorOverview {
  id: number;
  name: string;
  level: number;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
  spots: FloorSpot[];
}

export const MapaAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    async function loadMapData() {
      try {
        setLoading(true);
        setError("");
        const floorsData = await adminService.getFloors();
        setFloors(floorsData);
      } catch (err: any) {
        setError(err.message || "Error al cargar la telemetría del mapa");
      } finally {
        setLoading(false);
      }
    }
    loadMapData();
  }, []);

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
          <span className="text-xs font-semibold text-[#8892a4] uppercase tracking-[0.2em] animate-pulse font-mono">Cargando Mapa Satelital...</span>
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-semibold text-sm transition duration-200 text-left cursor-pointer"
          >
            <LayoutDashboard className="w-4.5 h-4.5" />
            Dashboard
          </button>
          <button
            onClick={() => navigate("/admin/mapa")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-bold text-sm shadow-[0_0_12px_rgba(0,240,255,0.08)] text-left cursor-pointer"
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
            <h1 className="text-lg font-black uppercase tracking-[0.15em] text-[#e8ecf1]">Mapa Satelital</h1>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-auto p-8 pb-28 space-y-8">
          
          {floors.length === 0 ? (
            <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl p-12 text-center">
              <CardContent className="flex flex-col items-center justify-center gap-3 text-[#8892a4]">
                <Layers className="w-12 h-12 opacity-40 animate-pulse" />
                <span className="text-sm font-semibold font-mono uppercase tracking-widest">No hay plantas configuradas en la base de datos</span>
              </CardContent>
            </Card>
          ) : (
            /* Render floors side-by-side or stacked cleanly in a responsive grid */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {floors.map((floor) => {
                const spotsList = floor.spots || [];

                return (
                  <Card key={floor.id} className="border-border bg-card/60 backdrop-blur-md shadow-2xl flex flex-col w-full !overflow-visible">
                    <CardHeader className="px-6 pt-5 pb-3 border-b border-border/40">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-base font-extrabold text-[#e8ecf1] tracking-wide uppercase">{floor.name}</CardTitle>
                          <CardDescription className="text-xs text-[#8892a4] font-mono mt-0.5">Nivel estructural: {floor.level}</CardDescription>
                        </div>
                        <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono text-xs tracking-wider px-3 py-1">
                          {floor.occupiedSpots} / {floor.totalSpots} Slots Ocupados
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-6 flex-1 !overflow-visible">
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 xl:grid-cols-8 gap-3">
                        {spotsList.map((spot) => {
                          const isSpotOccupied = spot.isOccupied;
                          const vehicle = spot.vehicle;

                          return (
                            <div
                              key={spot.id}
                              className={`h-16 border flex flex-col items-center justify-between py-2 px-1 relative group transition duration-300 select-none cursor-pointer ${
                                isSpotOccupied
                                  ? 'bg-gradient-to-b from-[#ff6b2c]/5 to-[#ff6b2c]/15 border-[#ff6b2c]/40 shadow-[0_0_8px_rgba(255,107,44,0.02)] hover:border-[#ff6b2c] hover:shadow-[0_0_15px_rgba(255,107,44,0.2)]'
                                  : 'bg-gradient-to-b from-[#00f0ff]/5 to-[#00f0ff]/10 border-[#00f0ff]/25 shadow-[0_0_8px_rgba(0,240,255,0.01)] hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                              }`}
                            >
                              {/* Spot Label */}
                              <span className="text-[10px] font-black font-mono leading-none tracking-wider text-[#8892a4] group-hover:text-white transition duration-200">
                                {spot.label}
                              </span>

                              {/* Spot Type Dot */}
                              <span className={`w-2 h-2 rounded-full ${
                                isSpotOccupied ? 'bg-[#ff6b2c] shadow-[0_0_6px_#ff6b2c]' : 'bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]'
                              }`} />

                              {/* Glowing Tech HUD Tooltip for Occupied Slot */}
                              {isSpotOccupied && vehicle && (
                                <div className="absolute bottom-18 left-1/2 transform -translate-x-1/2 w-60 p-4 bg-[#0a0c12]/95 border border-[#ff6b2c]/50 text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-300 z-50 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(255,107,44,0.25)] flex flex-col gap-2.5 backdrop-blur-md rounded-none">
                                  {/* Header */}
                                  <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-[#ff6b2c]/70 border-b border-border/40 pb-1">
                                    <span>Cochera {spot.label}</span>
                                    <span>Ocupado</span>
                                  </div>

                                  {/* Plate layout */}
                                  <div className="mx-auto w-fit px-3 py-1 border border-[#ff6b2c]/40 bg-[#ff6b2c]/5 text-[#ff6b2c] font-black font-mono text-xs tracking-widest mt-1">
                                    {vehicle.licensePlate}
                                  </div>

                                  {/* Vehicle detail text */}
                                  <div className="leading-tight mt-1">
                                    <span className="block text-[9px] text-[#8892a4] uppercase font-mono tracking-wider">Vehículo</span>
                                    <span className="block text-xs font-bold text-[#e8ecf1] truncate">
                                      {vehicle.brand || "Desconocido"} {vehicle.model || ""}
                                    </span>
                                  </div>

                                  {/* Entry Time Info */}
                                  <div className="flex justify-between items-center border-t border-border/30 pt-2 text-[9px] font-mono text-[#8892a4] mt-1">
                                    <span>Ingreso:</span>
                                    <span className="text-[#e8ecf1] font-bold">
                                      {new Date(vehicle.entryAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

        </div>

        {/* Floating Dock Quick Actions */}
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
