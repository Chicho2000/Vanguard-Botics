import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import { Clock, CreditCard, LogOut, ShieldCheck, Zap, Map, Layers, Timer, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FloorOverview {
  id: number;
  name: string;
  level: number;
  totalSpots: number;
  occupiedSpots: number;
  availableSpots: number;
}

export const DashboardCliente: React.FC = () => {
  const { user, logout } = useAuth();
  const [floors, setFloors] = useState<FloorOverview[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);

  useEffect(() => {
    async function loadMap() {
      try {
        setLoadingMap(true);
        const floorsData = await adminService.getFloors();
        setFloors(floorsData);
      } catch {
        // silently fail — will show empty state
      } finally {
        setLoadingMap(false);
      }
    }
    loadMap();
  }, []);

  // Subscription offer plans
  const offers = [
    { label: "Por Hora", price: "—", icon: Timer, color: "text-[#00f0ff]", borderColor: "border-[#00f0ff]/20", bgColor: "bg-[#00f0ff]/10" },
    { label: "Diario", price: "—", icon: Clock, color: "text-[#ff6b2c]", borderColor: "border-[#ff6b2c]/20", bgColor: "bg-[#ff6b2c]/10" },
    { label: "Semanal", price: "—", icon: Tag, color: "text-indigo-400", borderColor: "border-indigo-500/20", bgColor: "bg-indigo-500/10" },
    { label: "Trimestral", price: "—", icon: CreditCard, color: "text-amber-400", borderColor: "border-amber-500/20", bgColor: "bg-amber-500/10" },
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
        <Card className="border-border bg-card/60 backdrop-blur-md shadow-2xl">
          <CardHeader className="px-6 pt-5 pb-2">
            <CardTitle className="text-base font-extrabold text-[#e8ecf1] flex items-center gap-2 font-sans">
              <Map className="w-4 h-4 text-[#00f0ff]" />
              Mapa de la Cochera
            </CardTitle>
            <CardDescription className="text-xs text-[#8892a4] font-mono">Visualización de espacios libres y ocupados</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-5">
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
              <div className="space-y-6">
                {floors.map(floor => {
                  const spots = Array.from({ length: Math.min(floor.totalSpots, 40) }, (_, i) => {
                    return i < floor.occupiedSpots ? 'occupied' : 'free';
                  });

                  return (
                    <div key={floor.id} className="space-y-3 p-4 bg-background/40 border border-border">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-extrabold text-[#e8ecf1] uppercase tracking-[0.15em] font-sans">{floor.name}</span>
                        <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono text-[10px] tracking-wide">
                          {floor.availableSpots} / {floor.totalSpots} Libres
                        </Badge>
                      </div>
                      
                      {/* Spots visualization */}
                      <div className="flex flex-wrap gap-1">
                        {spots.map((status, i) => (
                          <div 
                            key={i}
                            title={status === 'occupied' ? 'Ocupado' : 'Disponible'}
                            className={`w-5 h-7 border flex items-center justify-center transition duration-300 ${
                              status === 'occupied' 
                                ? 'bg-[#ff6b2c]/15 border-[#ff6b2c]/35 shadow-[inset_0_0_4px_rgba(255,107,44,0.1)]' 
                                : 'bg-[#00f0ff]/10 border-[#00f0ff]/25 shadow-[inset_0_0_4px_rgba(0,240,255,0.1)]'
                            }`}
                          >
                            <span className={`w-1 h-1 rounded-full ${
                              status === 'occupied' ? 'bg-[#ff6b2c]' : 'bg-[#00f0ff]'
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
              Abono Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-5">
            {/* Subscription Info */}
            <div className="p-4 bg-background/50 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Fecha de Suscripción</span>
                <span className="text-sm font-bold text-[#e8ecf1] font-mono">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Costo Próximo Mes</span>
                <span className="text-sm font-bold text-[#e8ecf1] font-mono">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Vencimiento</span>
                <span className="text-sm font-bold text-[#e8ecf1] font-mono">—</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Estancia</span>
                <Badge className="bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-mono text-[10px] tracking-wide">
                  Activa 24hs
                </Badge>
              </div>
            </div>

            {/* Subscription Offers */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#8892a4] uppercase tracking-[0.15em] font-sans">Otras Ofertas de Suscripción</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {offers.map((offer, i) => (
                  <div key={i} className={`p-3 border ${offer.borderColor} ${offer.bgColor} bg-opacity-5 flex flex-col items-center gap-2 text-center transition duration-300 hover:scale-[1.02]`}>
                    <offer.icon className={`w-5 h-5 ${offer.color}`} />
                    <span className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">{offer.label}</span>
                    <span className={`text-lg font-black font-mono ${offer.color}`}>{offer.price}</span>
                  </div>
                ))}
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
