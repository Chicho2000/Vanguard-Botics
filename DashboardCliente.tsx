import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import { subscriptionService } from "../services/subscription.service";
import { Clock, CreditCard, LogOut, ShieldCheck, Zap, Map, Layers, Tag, Loader2, AlertCircle, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FloorSpot {
  id: number;
  label: string;
  isOccupied: boolean;
  spotType: string;
  isOwnVehicle?: boolean;
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

export const DashboardCliente: React.FC = () => {
  const { user, logout } = useAuth();
  const [floors, setFloors] = useState<FloorOverview[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);

  const [activeSub, setActiveSub] = useState<any>(null);
  const [publicConfigs, setPublicConfigs] = useState<Record<string, string>>({});
  const [loadingSub, setLoadingSub] = useState(true);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function loadMap() {
      try {
        setLoadingMap(true);
        const floorsData = await adminService.getFloorsForUser();
        setFloors(floorsData);
      } catch {
        // silently fail — will show empty state
      } finally {
        setLoadingMap(false);
      }
    }
    loadMap();
  }, []);

  useEffect(() => {
    async function loadSubscription() {
      try {
        setLoadingSub(true);
        const sub = await subscriptionService.getActiveSubscription();
        setActiveSub(sub);
      } catch (error) {
        console.error("Error loading subscription:", error);
      } finally {
        setLoadingSub(false);
      }
    }
    async function loadConfigs() {
      try {
        const configs = await adminService.getPublicConfigs();
        setPublicConfigs(configs);
      } catch (error) {
        console.error("Error loading public configs:", error);
      }
    }
    loadSubscription();
    loadConfigs();
  }, []);

  const handlePlanChange = async (planType: "DAILY" | "MONTHLY" | "QUARTERLY" | "YEARLY") => {
    try {
      setChangingPlan(planType);
      setMessage(null);
      const updated = await subscriptionService.changePlan(planType);
      setActiveSub(updated);
      setMessage({ type: "success", text: `¡Plan cambiado a ${getPlanLabel(planType)} con éxito!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Error al cambiar el plan." });
    } finally {
      setChangingPlan(null);
    }
  };

  const getPlanLabel = (type: string) => {
    switch (type) {
      case "DAILY": return "Diario";
      case "MONTHLY": return "Mensual";
      case "QUARTERLY": return "Trimestral";
      case "YEARLY": return "Anual";
      default: return type;
    }
  };

  const getPlanCost = (type: string) => {
    if (!publicConfigs) return "—";
    switch (type) {
      case "DAILY": return `$${publicConfigs.rate_daily || "3000"}`;
      case "MONTHLY": return `$${publicConfigs.rate_monthly || "45000"}`;
      case "QUARTERLY": return `$${publicConfigs.rate_quarterly || "120000"}`;
      case "YEARLY": return `$${publicConfigs.rate_yearly || "390000"}`;
      default: return "—";
    }
  };

  const offers = [
    { type: "DAILY" as const, label: "Diario", price: publicConfigs.rate_daily ? `$${publicConfigs.rate_daily}` : "—", icon: Clock, color: "text-[#ff6b2c]", borderColor: "border-[#ff6b2c]/20", bgColor: "bg-[#ff6b2c]/10" },
    { type: "MONTHLY" as const, label: "Mensual", price: publicConfigs.rate_monthly ? `$${publicConfigs.rate_monthly}` : "—", icon: Tag, color: "text-indigo-400", borderColor: "border-indigo-500/20", bgColor: "bg-indigo-500/10" },
    { type: "QUARTERLY" as const, label: "Trimestral", price: publicConfigs.rate_quarterly ? `$${publicConfigs.rate_quarterly}` : "—", icon: CreditCard, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/10" },
    { type: "YEARLY" as const, label: "Anual", price: publicConfigs.rate_yearly ? `$${publicConfigs.rate_yearly}` : "—", icon: Zap, color: "text-emerald-400", borderColor: "border-emerald-500/20", bgColor: "bg-emerald-500/10" },
  ];

  return (
    <div className="min-h-screen bg-transparent text-[#e8ecf1] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-8 flex flex-col gap-8 z-10">

        {/* Welcome Header */}
        <div className="space-y-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/25 text-[11px] font-semibold text-[#00f0ff] uppercase tracking-[0.2em] mb-1 shadow-sm font-mono">
            <Zap className="w-3.5 h-3.5" />
            Acceso Autorizado
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-sans">
            Hola, <span className="bg-gradient-to-r from-[#00f0ff] to-cyan-300 bg-clip-text text-transparent">{user?.nombre}</span>
          </h2>
          <p className="text-[#8892a4] text-sm font-sans">Panel de monitoreo y gestión de tu estacionamiento</p>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Stay */}
          <Card className="bg-card/60 border-border hover:border-[#00f0ff]/30 transition duration-300">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="p-2.5 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                <Clock className="w-6 h-6 text-[#00f0ff]" />
              </div>
              <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.2em] font-mono">Estancia Activa</p>
              <p className="font-mono font-black text-lg text-[#00f0ff]">24hs</p>
            </CardContent>
          </Card>

          {/* Floor Count */}
          <Card className="bg-card/60 border-border hover:border-indigo-500/30 transition duration-300">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2.5">
              <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20">
                <Layers className="w-6 h-6 text-indigo-400" />
              </div>
              <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.2em] font-mono">Pisos Disponibles</p>
              <p className="font-mono font-black text-lg text-indigo-400">{floors.length || "—"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Garage Map Section */}
        <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl !overflow-visible">
          <CardHeader className="px-6 pt-5 pb-2">
            <CardTitle className="text-base font-extrabold text-[#e8ecf1] flex items-center gap-2 font-sans">
              <Map className="w-4 h-4 text-[#00f0ff]" />
              Mapa de la Cochera
            </CardTitle>
            <CardDescription className="text-xs text-[#8892a4] font-mono">Visualización de espacios libres y ocupados</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5 !overflow-visible">
            {loadingMap ? (
              <div className="h-[200px] flex items-center justify-center text-[#8892a4]">
                <span className="text-xs font-semibold font-mono uppercase tracking-widest animate-pulse">Cargando mapa...</span>
              </div>
            ) : floors.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-[#8892a4] text-xs gap-2">
                <ShieldCheck className="w-8 h-8 opacity-45" />
                <span className="font-mono">No hay plantas configuradas.</span>
              </div>
            ) : (
              <div className="space-y-6 !overflow-visible">
                {floors.map(floor => {
                  const spotsList = floor.spots || [];

                  return (
                    <div key={floor.id} className="space-y-3 p-4 bg-background/40 border border-border !overflow-visible">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-[#e8ecf1] uppercase tracking-[0.15em] font-sans">{floor.name}</span>
                        <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono text-[10px] tracking-wide">
                          {floor.availableSpots} / {floor.totalSpots} Libres
                        </Badge>
                      </div>

                      {/* Spots visualization */}
                      <div className="flex flex-wrap gap-2 !overflow-visible">
                        {spotsList.map((spot) => {
                          const isSpotOccupied = spot.isOccupied;

                          return (
                            <div
                              key={spot.id}
                              className={`w-10 h-12 border flex flex-col items-center justify-between py-1.5 px-0.5 transition duration-300 select-none cursor-pointer relative group ${spot.isOwnVehicle
                                ? 'bg-gradient-to-b from-[#a855f7]/10 to-[#a855f7]/25 border-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.3)] animate-pulse hover:shadow-[0_0_18px_rgba(168,85,247,0.5)]'
                                : isSpotOccupied
                                  ? 'bg-gradient-to-b from-[#ff6b2c]/5 to-[#ff6b2c]/15 border-[#ff6b2c]/30 shadow-[0_0_8px_rgba(255,107,44,0.02)]'
                                  : 'bg-gradient-to-b from-[#00f0ff]/5 to-[#00f0ff]/10 border-[#00f0ff]/20 shadow-[0_0_8px_rgba(0,240,255,0.01)] hover:border-[#00f0ff] hover:shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                                }`}
                            >
                              {/* Spot Label */}
                              <span className={`text-[9px] font-black font-mono leading-none tracking-tight transition duration-200 ${spot.isOwnVehicle
                                ? 'text-[#c084fc] group-hover:text-white'
                                : 'text-[#8892a4] group-hover:text-white'
                                }`}>
                                {spot.label}
                              </span>

                              {/* Spot Type Dot */}
                              <span className={`w-1.5 h-1.5 rounded-full ${spot.isOwnVehicle
                                ? 'bg-[#a855f7] shadow-[0_0_6px_#a855f7]'
                                : isSpotOccupied
                                  ? 'bg-[#ff6b2c] shadow-[0_0_4px_#ff6b2c]'
                                  : 'bg-[#00f0ff] shadow-[0_0_4px_#00f0ff]'
                                }`} />

                              {/* HUD Tooltip for OWN vehicle */}
                              {spot.isOwnVehicle && spot.vehicle && (
                                <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-52 p-3.5 bg-[#0a0c12]/95 border border-[#a855f7] text-left opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition duration-300 z-50 shadow-[0_10px_30px_rgba(0,0,0,0.9),0_0_15px_rgba(168,85,247,0.2)] flex flex-col gap-2 backdrop-blur-md rounded-none">
                                  <div className="flex justify-between items-center text-[8px] font-mono uppercase tracking-wider text-[#a855f7] border-b border-border/40 pb-1">
                                    <span>Tu Cochera ({spot.label})</span>
                                    <span className="animate-pulse font-bold">Tu Auto</span>
                                  </div>

                                  <div className="mx-auto w-fit px-2 py-0.5 border border-[#a855f7]/40 bg-[#a855f7]/5 text-[#c084fc] font-black font-mono text-[10px] tracking-widest mt-1">
                                    {spot.vehicle.licensePlate}
                                  </div>

                                  <div className="leading-tight mt-1">
                                    <span className="block text-[8px] text-[#8892a4] uppercase font-mono tracking-wider">Vehículo</span>
                                    <span className="block text-xs font-bold text-[#e8ecf1] truncate">
                                      {spot.vehicle.brand || "Desconocido"} {spot.vehicle.model || ""}
                                    </span>
                                  </div>

                                  <div className="flex justify-between items-center border-t border-border/30 pt-1.5 text-[8px] font-mono text-[#8892a4] mt-1">
                                    <span>Ingreso:</span>
                                    <span className="text-[#e8ecf1] font-bold">
                                      {new Date(spot.vehicle.entryAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* Tooltip for other occupied spots (privacy-safe) */}
                              {isSpotOccupied && !spot.isOwnVehicle && (
                                <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-32 p-2 bg-[#0a0c12]/95 border border-[#ff6b2c]/50 text-center opacity-0 pointer-events-none group-hover:opacity-100 transition duration-300 z-50 shadow-[0_8px_20px_rgba(0,0,0,0.8)] backdrop-blur-md rounded-none text-[9px] font-mono uppercase tracking-wider text-[#ff6b2c] font-semibold">
                                  Ocupado
                                </div>
                              )}

                              {/* Tooltip for free spots */}
                              {!isSpotOccupied && (
                                <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 w-32 p-2 bg-[#0a0c12]/95 border border-[#00f0ff]/40 text-center opacity-0 pointer-events-none group-hover:opacity-100 transition duration-300 z-50 shadow-[0_8px_20px_rgba(0,0,0,0.8)] backdrop-blur-md rounded-none text-[9px] font-mono uppercase tracking-wider text-[#00f0ff] font-semibold">
                                  Disponible
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Subscription Section */}
        <Card className="bg-card/60 backdrop-blur-md border-border shadow-xl">
          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-base font-black uppercase tracking-[0.15em] flex items-center gap-2 font-sans">
              <div className="p-1.5 bg-indigo-500/15 border border-indigo-500/20">
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              Plan de Abono / Suscripción
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-5">
            {/* Feedback Message Alert */}
            {message && (
              <div className={`flex items-center gap-3 p-3.5 border text-xs font-semibold font-mono ${message.type === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                }`}>
                {message.type === "success" ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                <span>{message.text}</span>
              </div>
            )}

            {loadingSub ? (
              <div className="h-[140px] flex items-center justify-center text-[#8892a4]">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-400 mr-2" />
                <span className="text-xs font-semibold font-mono uppercase tracking-widest animate-pulse">Obteniendo Abono...</span>
              </div>
            ) : activeSub ? (
              /* Subscription Info */
              <div className="p-4 bg-background/50 border border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Plan de Pago Actual</span>
                  <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono text-[10px] tracking-wide font-bold uppercase">
                    Abono {getPlanLabel(activeSub.type)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Fecha de Inicio</span>
                  <span className="text-sm font-bold text-[#e8ecf1] font-mono">
                    {new Date(activeSub.validFrom).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Costo del Plan</span>
                  <span className="text-sm font-black text-[#00f0ff] font-mono">{getPlanCost(activeSub.type)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Fecha de Vencimiento</span>
                  <span className="text-sm font-bold text-[#e8ecf1] font-mono">
                    {new Date(activeSub.validUntil).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Estado del Abono</span>
                  <Badge className={`font-mono text-[10px] tracking-wide font-bold uppercase ${activeSub.status === "ACTIVE"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                    }`}>
                    {activeSub.status === "ACTIVE" ? "Activo" : activeSub.status}
                  </Badge>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-background/50 border border-border text-center text-[#8892a4] text-xs font-mono">
                No se encontró un abono activo.
              </div>
            )}

            {/* Subscription Offers */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-[#8892a4] uppercase tracking-[0.15em] font-sans">Cambiar / Elegir otro Plan</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {offers.map((offer, i) => {
                  const isActive = activeSub && activeSub.type === offer.type;
                  const isChangingThis = changingPlan === offer.type;

                  return (
                    <div
                      key={i}
                      className={`p-4 border flex flex-col justify-between items-center gap-3 text-center transition duration-300 relative rounded-none ${isActive
                        ? "border-[#00f0ff] bg-[#00f0ff]/5 shadow-[0_0_12px_rgba(0,240,255,0.1)]"
                        : `${offer.borderColor} ${offer.bgColor} bg-opacity-5 hover:scale-[1.01]`
                        }`}
                    >
                      {isActive && (
                        <span className="absolute -top-2 px-2 py-0.5 bg-[#00f0ff] text-background text-[8px] font-mono font-black uppercase tracking-wider">
                          Activo
                        </span>
                      )}

                      <div className="flex flex-col items-center gap-2">
                        <offer.icon className={`w-5 h-5 ${isActive ? "text-[#00f0ff]" : offer.color}`} />
                        <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">{offer.label}</span>
                        <span className={`text-lg font-black font-mono ${isActive ? "text-[#00f0ff]" : offer.color}`}>
                          {offer.price}
                        </span>
                      </div>

                      {!isActive && (
                        <Button
                          size="sm"
                          onClick={() => handlePlanChange(offer.type)}
                          disabled={changingPlan !== null}
                          className="w-full h-8 bg-transparent hover:bg-white/5 text-xs text-[#e8ecf1] border border-border/80 rounded-none mt-2 font-mono"
                        >
                          {isChangingThis ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            "Activar"
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Action */}
        <Button
          variant="ghost"
          onClick={logout}
          className="text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/15 mx-auto mt-4 transition duration-300 font-semibold flex items-center gap-2 text-xs font-sans"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión Segura
        </Button>
      </main>
    </div>
  );
};
