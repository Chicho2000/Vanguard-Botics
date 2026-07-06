import React, { useCallback, useEffect, useState } from "react";
import { Clock, Loader2, LogOut, MapPin, Receipt, RefreshCw, ShieldCheck } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VanguardCarIcon from "@/components/ui/VanguardCarIcon";
import { parkingSessionService, type CurrentParkingSession } from "../services/parking-session.service";

const formatElapsed = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours > 0 ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
};

export const DashboardInvitado: React.FC = () => {
  const { logout } = useAuth();
  const [session, setSession] = useState<CurrentParkingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);

  const loadSession = useCallback(async () => {
    try {
      setError("");
      setSession(await parkingSessionService.getCurrent());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el estado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSession();
    const interval = window.setInterval(() => void loadSession(), 30_000);
    return () => window.clearInterval(interval);
  }, [loadSession]);

  return (
    <div className="min-h-screen bg-transparent text-[#e8ecf1] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] text-[#00f0ff] uppercase tracking-[0.2em] font-mono">Estacionamiento en curso</p>
            <h2 className="text-2xl font-black mt-1">Estado de tu vehículo</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => void loadSession()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Actualizar
          </Button>
        </div>

        {loading && !session ? (
          <div className="py-24 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#00f0ff]" /></div>
        ) : error && !session ? (
          <Card className="border-rose-500/30 bg-rose-500/5"><CardContent className="p-8 text-center text-rose-300">{error}</CardContent></Card>
        ) : session && (
          <>
            <Card className="border-[#00f0ff]/30 bg-card/70 overflow-hidden">
              <div className="h-0.5 bg-[#00f0ff] shadow-[0_0_12px_#00f0ff]" />
              <CardContent className="p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#00f0ff]/10 border border-[#00f0ff]/20">
                    <VanguardCarIcon size={38} className="text-[#00f0ff]" />
                  </div>
                  <div>
                    <p className="text-3xl font-mono font-black tracking-widest text-[#00f0ff]">{session.licensePlate}</p>
                    <p className="text-xs text-[#8892a4] mt-1">{session.vehicle.brand || "Vehículo"}</p>
                  </div>
                </div>
                <div className="px-4 py-2 border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> SESIÓN ACTIVA
                </div>
              </CardContent>
            </Card>

            <div className="grid sm:grid-cols-3 gap-4">
              <Card className="bg-card/60 border-border"><CardContent className="p-5 text-center space-y-2"><MapPin className="w-5 h-5 mx-auto text-[#a855f7]"/><p className="text-[10px] uppercase tracking-wider text-[#8892a4]">Ubicación</p><p className="font-bold">{session.spot}</p><p className="text-xs text-[#8892a4]">{session.floor}</p></CardContent></Card>
              <Card className="bg-card/60 border-border"><CardContent className="p-5 text-center space-y-2"><Clock className="w-5 h-5 mx-auto text-[#ff6b2c]"/><p className="text-[10px] uppercase tracking-wider text-[#8892a4]">Tiempo</p><p className="font-mono font-black text-xl text-[#ff6b2c]">{formatElapsed(session.elapsedMinutes)}</p><p className="text-xs text-[#8892a4]">Desde {new Date(session.entryAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}</p></CardContent></Card>
              <Card className="bg-card/60 border-border"><CardContent className="p-5 text-center space-y-2"><Receipt className="w-5 h-5 mx-auto text-[#00f0ff]"/><p className="text-[10px] uppercase tracking-wider text-[#8892a4]">Estimado</p><p className="font-mono font-black text-xl text-[#00f0ff]">${session.estimatedAmount.toLocaleString("es-AR")}</p><p className="text-xs text-[#8892a4]">${session.hourlyRate.toLocaleString("es-AR")}/hora</p></CardContent></Card>
            </div>

            <Card className="bg-[#00f0ff]/5 border-[#00f0ff]/20"><CardContent className="p-5 text-sm text-[#c8d0dc] leading-relaxed"><strong className="text-[#00f0ff]">Para retirarte:</strong> acercate a la terminal de salida e ingresá tu patente. El sistema utilizará esta sesión activa; no necesitás escanear ningún código.</CardContent></Card>
            <Button
              disabled={finishing}
              onClick={async () => {
                try {
                  setFinishing(true);
                  await parkingSessionService.finishCurrent();
                  logout();
                } catch (reason) {
                  setError(reason instanceof Error ? reason.message : "No se pudo registrar la salida");
                } finally { setFinishing(false); }
              }}
              className="w-full bg-[#ff6b2c] text-black font-black"
            >{finishing ? "REGISTRANDO SALIDA..." : "REGISTRAR SALIDA"}</Button>
          </>
        )}

        {error && session && <p className="text-xs text-amber-400 text-center">Última actualización: {error}</p>}
        <Button variant="ghost" onClick={logout} className="w-full text-[#8892a4]"><LogOut className="w-4 h-4 mr-2" />Salir del sistema</Button>
      </main>
    </div>
  );
};
