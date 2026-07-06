import React, { useCallback, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import {
  Users, Layers, Loader2, AlertCircle,
  LayoutDashboard, Map, Settings, LogOut,
  Pencil, X, Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Dock from "@/components/ui/Dock";
import type { DockItemData } from "@/components/ui/Dock";
import VanguardCarIcon from "@/components/ui/VanguardCarIcon";
import { getErrorMessage } from "../lib/validation";

interface FloorSpot {
  id: number;
  label: string;
  isOccupied: boolean;
  isReserved: boolean;
  status: "OCCUPIED" | "RESERVED" | "EMPTY";
  spotType: string;
  maxWidthCm: number;
  row: number;
  column: number;
  assignedUserId: number | null;
  activeSessionId: number | null;
  isGuest?: boolean;
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

interface EditModalState {
  spot: FloorSpot;
  floorId: number;
  targetSpotId: string;
}

const spotTypeColor: Record<string, string> = {
  NORMAL: "#00f0ff",
  DISABLED: "#a855f7",
  EV_CHARGING: "#22c55e",
  MOTORCYCLE: "#f59e0b",
};

export const MapaAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [floors, setFloors] = useState<FloorOverview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit modal state
  const [editModal, setEditModal] = useState<EditModalState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    document.documentElement.classList.add("admin-active");
    return () => {
      document.documentElement.classList.remove("admin-active");
    };
  }, []);

  const loadMapData = useCallback(async (background = false) => {
    try {
      if (!background) setLoading(true);
      setError("");
      const floorsData = await adminService.getFloors();
      setFloors(floorsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al cargar la telemetría del mapa"));
    } finally {
      if (!background) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMapData(false);
    const interval = window.setInterval(() => void loadMapData(true), 10_000);
    const refresh = () => void loadMapData(true);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [loadMapData]);

  const openEditModal = (spot: FloorSpot, floorId: number) => {
    setSaveError("");
    setSaveSuccess("");
    setEditModal({
      spot,
      floorId,
      targetSpotId: "",
    });
  };

  const closeEditModal = () => {
    if (!saving) setEditModal(null);
  };

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      if (!editModal.targetSpotId) {
        setSaveError("Elegí el nuevo lugar.");
        setSaving(false);
        return;
      }

      const target = floors.flatMap((floor) => floor.spots).find((spot) => spot.id === Number(editModal.targetSpotId));
      await adminService.relocateParkingSpot(editModal.spot.id, Number(editModal.targetSpotId));
      setSaveSuccess(target?.status === "EMPTY" ? "Vehículo trasladado." : "Lugares intercambiados correctamente.");
      // Reload map data in background
      await loadMapData(true);
      setTimeout(() => {
        setEditModal(null);
        setSaveSuccess("");
      }, 1200);
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, "Error al guardar los cambios."));
    } finally {
      setSaving(false);
    }
  };

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
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#8892a4] uppercase tracking-widest">
            <Pencil className="w-3 h-3 text-[#00f0ff]/60" />
            <span>Clic en un lugar para asignar o trasladar un vehículo</span>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {floors.map((floor) => {
                const spotsList = floor.spots || [];

                // Group spots by row
                const spotsByRow = spotsList.reduce<Record<number, FloorSpot[]>>((acc, spot) => {
                  if (!acc[spot.row]) {
                    acc[spot.row] = [];
                  }
                  acc[spot.row].push(spot);
                  return acc;
                }, {});

                const sortedRowNumbers = Object.keys(spotsByRow)
                  .map(Number)
                  .sort((a, b) => a - b);

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

                    <CardContent className="p-6 flex-1 !overflow-visible space-y-6">
                      {sortedRowNumbers.map((rowNum) => {
                        const rowSpots = spotsByRow[rowNum].sort((a, b) => a.column - b.column);

                        return (
                          <div key={rowNum} className="space-y-2.5">
                            <h3 className="text-xs font-bold font-mono text-[#8892a4] uppercase tracking-widest border-b border-border/20 pb-1.5 flex items-center justify-between">
                              <span>Fila {rowNum}</span>
                              <span className="text-[10px] text-[#8892a4]/60 font-normal font-mono normal-case">
                                {rowSpots.filter(s => s.status === "OCCUPIED").length} Ocupados / {rowSpots.filter(s => s.status === "RESERVED").length} Reservados
                              </span>
                            </h3>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                              {rowSpots.map((spot, index) => {
                                const isSpotOccupied = spot.status === "OCCUPIED";
                                const isSpotReserved = spot.status === "RESERVED";
                                const vehicle = spot.vehicle;
                                const typeColor = spotTypeColor[spot.spotType] || "#00f0ff";

                                const isLeftLimit = index === 0 || index === 1;
                                const isRightLimit = index === rowSpots.length - 1 || index === rowSpots.length - 2;
                                const tooltipAlignClass = isLeftLimit
                                  ? "left-0 translate-x-0"
                                  : isRightLimit
                                    ? "right-0 left-auto translate-x-0"
                                    : "left-1/2 -translate-x-1/2";

                                return (
                                  <div
                                    key={spot.id}
                                    onClick={() => { if (spot.status !== "EMPTY") openEditModal(spot, floor.id); }}
                                    className={`h-16 border flex flex-col items-center justify-between py-2 px-1 relative group transition duration-300 select-none ${spot.status === "EMPTY" ? "cursor-default" : "cursor-pointer"} ${
                                      isSpotOccupied
                                        ? 'bg-gradient-to-b from-[#ff6b2c]/5 to-[#ff6b2c]/15 border-[#ff6b2c]/40 shadow-[0_0_8px_rgba(255,107,44,0.02)] hover:border-[#ff6b2c] hover:shadow-[0_0_15px_rgba(255,107,44,0.2)]'
                                        : isSpotReserved
                                          ? 'bg-gradient-to-b from-[#6366f1]/5 to-[#6366f1]/15 border-[#6366f1]/40 shadow-[0_0_8px_rgba(99,102,241,0.02)] hover:border-[#6366f1] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                          : 'bg-gradient-to-b from-[#00f0ff]/5 to-[#00f0ff]/10 border-[#00f0ff]/25 shadow-[0_0_8px_rgba(0,240,255,0.01)] hover:border-[#00f0ff] hover:shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                                    }`}
                                  >
                                    {/* Edit overlay icon on hover */}
                                    {spot.status !== "EMPTY" && <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 z-10 bg-black/30"><Pencil className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.5)]" /></div>}

                                    {/* Spot Type indicator dot (colored by type) */}
                                    <span
                                      className="w-1.5 h-1.5 rounded-full absolute top-1.5 right-1.5"
                                      style={{ backgroundColor: typeColor, boxShadow: `0 0 4px ${typeColor}` }}
                                    />

                                    {/* Spot Label */}
                                    <span className="text-[10px] font-black font-mono leading-none tracking-wider text-[#8892a4] group-hover:text-white transition duration-200">
                                      {spot.label}
                                    </span>

                                    {/* Status dot */}
                                    <span className={`w-2 h-2 rounded-full ${
                                      isSpotOccupied
                                        ? 'bg-[#ff6b2c] shadow-[0_0_6px_#ff6b2c]'
                                        : isSpotReserved
                                          ? 'bg-[#6366f1] shadow-[0_0_6px_#6366f1]'
                                          : 'bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]'
                                    }`} />

                                    {/* Tooltip for Occupied Spot */}
                                    {isSpotOccupied && vehicle && (
                                      <div className={`absolute bottom-18 w-60 p-4 bg-[#0a0c12]/95 border border-[#ff6b2c]/50 text-left opacity-0 pointer-events-none group-hover:opacity-100 transition duration-300 z-50 shadow-[0_10px_35px_rgba(0,0,0,0.9),0_0_20px_rgba(255,107,44,0.25)] flex flex-col gap-2.5 backdrop-blur-md rounded-none ${tooltipAlignClass}`}>
                                        <div className="flex justify-between items-center text-[9px] font-mono uppercase tracking-wider text-[#ff6b2c]/70 border-b border-border/40 pb-1">
                                          <span>Cochera {spot.label}</span>
                                          <span>Ocupado</span>
                                        </div>
                                        <div className="mx-auto w-fit px-3 py-1 border border-[#ff6b2c]/40 bg-[#ff6b2c]/5 text-[#ff6b2c] font-black font-mono text-xs tracking-widest mt-1">
                                          {vehicle.licensePlate}
                                        </div>
                                        {spot.isGuest && <div className="text-center text-[9px] font-black tracking-widest text-amber-400">INVITADO</div>}
                                        <div className="leading-tight mt-1">
                                          <span className="block text-[9px] text-[#8892a4] uppercase font-mono tracking-wider">Vehículo</span>
                                          <span className="block text-xs font-bold text-[#e8ecf1] truncate">
                                            {vehicle.brand || "Desconocido"}
                                          </span>
                                        </div>
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
                          </div>
                        );
                      })}
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

      {/* ─── EDIT SPOT MODAL ───────────────────────────────────────── */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeEditModal(); }}
        >
          <div className="w-full max-w-md bg-[#0a0c12] border border-[#00f0ff]/25 shadow-[0_0_60px_rgba(0,240,255,0.08),0_25px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#00f0ff] shadow-[0_1px_10px_rgba(0,240,255,0.5)]" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className="bg-[#00f0ff]/10 border border-[#00f0ff]/20 p-2">
                  <Pencil className="w-4 h-4 text-[#00f0ff]" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.15em] text-[#e8ecf1]">
                    Cambiar lugar {editModal.spot.label}
                  </h2>
                  <p className="text-[10px] text-[#8892a4] font-mono mt-0.5">
                    ID #{editModal.spot.id} · {editModal.spot.status === "OCCUPIED" ? "Ocupado" : editModal.spot.status === "RESERVED" ? "Reservado" : "Libre"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="p-2 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 transition duration-200 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="px-6 py-5 space-y-5">
              {/* Current status info */}
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">
                  Nuevo lugar
                </Label>
                <select
                  value={editModal.targetSpotId}
                  onChange={(event) => setEditModal({ ...editModal, targetSpotId: event.target.value })}
                  disabled={saving}
                  className="w-full h-10 px-3 bg-background/40 border border-border text-sm text-[#e8ecf1] focus:border-[#00f0ff]/50 outline-none"
                >
                  <option value="">Elegí el lugar destino</option>
                  {floors.flatMap((floor) => floor.spots.map((spot) => ({ floor, spot })))
                    .filter(({ spot }) => spot.id !== editModal.spot.id)
                    .map(({ floor, spot }) => <option key={spot.id} value={spot.id}>{floor.name} · {spot.label} · {spot.status === "EMPTY" ? "Libre" : spot.status === "RESERVED" ? "Reservado (se intercambia)" : `Ocupado${spot.vehicle ? ` por ${spot.vehicle.licensePlate}` : ""} (se intercambia)`}</option>)}
                </select>
                <p className="text-[10px] text-[#8892a4]/60 font-mono">
                  Si el destino está ocupado o reservado, ambos lugares se intercambian automáticamente.
                </p>
              </div>

              {/* Current status info */}
              <div className="p-3 bg-secondary/30 border border-border/40 space-y-1">
                <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-widest font-mono">Estado Actual</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 border ${
                    editModal.spot.status === "OCCUPIED" ? "text-[#ff6b2c] border-[#ff6b2c]/30 bg-[#ff6b2c]/5" :
                    editModal.spot.status === "RESERVED" ? "text-[#6366f1] border-[#6366f1]/30 bg-[#6366f1]/5" :
                    "text-[#00f0ff] border-[#00f0ff]/30 bg-[#00f0ff]/5"
                  }`}>
                    {editModal.spot.status === "OCCUPIED" ? "Ocupado" : editModal.spot.status === "RESERVED" ? "Reservado" : "Libre"}
                  </span>
                  {editModal.spot.vehicle && (
                    <span className="text-[10px] text-[#8892a4] font-mono">
                      🚗 {editModal.spot.vehicle.licensePlate}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#8892a4]/50 font-mono mt-1">El estado de ocupación lo gestiona el sistema automáticamente.</p>
              </div>

              {/* Error / Success feedback */}
              {saveError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-bold">
                  {saveError}
                </div>
              )}
              {saveSuccess && (
                <div className="p-3 bg-[#00f0ff]/10 border border-[#00f0ff]/20 text-[#00f0ff] text-[11px] font-bold">
                  {saveSuccess}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 pb-6 flex gap-3">
              <Button
                variant="outline"
                onClick={closeEditModal}
                disabled={saving}
                className="flex-1 h-10 border-border text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 font-bold text-xs tracking-wider transition duration-300"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 h-10 bg-[#00f0ff] hover:bg-[#33f3ff] text-[#050508] font-bold text-xs tracking-wider transition duration-300 shadow-md hover:shadow-[#00f0ff]/25 hover:shadow-lg"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Guardando...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="w-3.5 h-3.5" />
                    Guardar Cambios
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
