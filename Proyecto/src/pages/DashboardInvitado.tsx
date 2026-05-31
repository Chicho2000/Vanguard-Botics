import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Clock, CreditCard, LogOut, QrCode, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import VanguardCarIcon from "@/components/ui/VanguardCarIcon";
import BorderGlow from "@/components/ui/BorderGlow";
import { adminService } from "../services/admin.service";


/**
 * Calculates billable hours based on parking rules:
 * - Under 30 min: 0 (grace period)
 * - 30-59 min: 0.5 hours (half hour charge)
 * - 60+ min: rounds UP to the nearest hour (e.g. 1h01m = 2h, 1h30m = 2h, 1h29m = 1h)
 * 
 * Rule: from 60 min onward, if the excess minutes >= 30, round up.
 */
function calculateBillableHours(elapsedMs: number): number {
  const totalMinutes = Math.floor(elapsedMs / 60000);
  
  if (totalMinutes < 30) return 0;
  if (totalMinutes < 60) return 0.5;
  
  const fullHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;
  
  if (remainingMinutes >= 30) {
    return fullHours + 1;
  }
  return fullHours;
}

function formatElapsedTime(elapsedMs: number): string {
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes.toString().padStart(2, "0")}m`;
}

export const DashboardInvitado: React.FC = () => {
  const { user, logout } = useAuth();
  
  // Tarifa por hora — fetched from admin config (fallback: 500)
  const [tarifaHora, setTarifaHora] = useState<number>(500);

  // Entry time — captured when the component mounts (simulating session start)
  const [entryTime] = useState<Date>(() => new Date());
  const [elapsedMs, setElapsedMs] = useState(0);

  // Fetch live hourly rate from public config endpoint
  useEffect(() => {
    adminService.getPublicConfigs()
      .then((cfg) => {
        const rate = parseFloat(cfg.rate_hourly);
        if (!isNaN(rate) && rate > 0) {
          setTarifaHora(rate);
        }
      })
      .catch(() => {
        // Keep fallback value on error
      });
  }, []);

  // Update elapsed time every 30 seconds for accuracy
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedMs(Date.now() - entryTime.getTime());
    }, 30000); // every 30 seconds
    
    // Initial update immediately
    setElapsedMs(Date.now() - entryTime.getTime());
    
    return () => clearInterval(interval);
  }, [entryTime]);

  const billableHours = calculateBillableHours(elapsedMs);
  const totalAmount = billableHours * tarifaHora;
  const entryTimeStr = entryTime.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen bg-transparent text-[#e8ecf1] flex flex-col font-sans">
      <Navbar />

      {/* Laser Scanning Animation Styles Injection */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 4%; }
          50% { top: 96%; }
        }
      `}</style>

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-12 flex flex-col items-center justify-center gap-8 z-10">
        
        {/* Patente Banner (Industrial Plate Simulation) */}
        <div className="text-center w-full space-y-4">
          <div className="relative group">
            {/* Ambient Cyan Halo Backlight Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-[#00f0ff] to-cyan-400 blur-xl opacity-35 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            {/* The Plate Frame */}
            <div className="relative bg-card border-2 border-[#00f0ff]/40 px-6 py-5 shadow-2xl flex flex-col items-center gap-2">
              {/* Plate Header Decal */}
              <div className="flex justify-between w-full text-[9px] font-mono uppercase tracking-[0.25em] text-[#00f0ff]/60 border-b border-border pb-1.5 mb-1.5">
                <span>Vanguard Botics</span>
                <span>Smart Parking</span>
              </div>
              
              <div className="flex items-center gap-4">
                <VanguardCarIcon className="text-[#00f0ff] drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" size={32} />
                <span className="text-4xl md:text-5xl font-mono font-black tracking-[0.15em] text-[#00f0ff] drop-shadow-[0_0_12px_rgba(0,240,255,0.6)]">
                  {user?.patente || "AB123CD"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Entry Time & Timer */}
        <div className="w-full grid grid-cols-2 gap-4">
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <Clock className="w-5 h-5 text-[#00f0ff]" />
              <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.2em] font-mono">Hora de Ingreso</p>
              <p className="font-mono font-black text-lg text-[#00f0ff]">{entryTimeStr}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card/60 border-border">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <Clock className="w-5 h-5 text-[#ff6b2c]" />
              <p className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.2em] font-mono">Tiempo Transcurrido</p>
              <p className="font-mono font-black text-lg text-[#ff6b2c]">{formatElapsedTime(elapsedMs)}</p>
            </CardContent>
          </Card>
        </div>

        {/* QR Code Section */}
        <BorderGlow
          borderRadius={0}
          backgroundColor="#0a0c12"
          glowColor="185 100 50"
          glowIntensity={1}
          colors={['#00f0ff', '#00b8d4', '#a855f7']}
          edgeSensitivity={20}
        >
          <Card className="border-[#00f0ff]/30 bg-transparent overflow-hidden relative shadow-2xl shadow-[#00f0ff]/5 border-0">
            {/* Neon Top Edge Accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#00f0ff] to-cyan-400"></div>
            
            <div className="bg-background/60 px-4 py-3 text-center border-b border-border flex items-center justify-center gap-2">
              <QrCode className="w-4 h-4 text-[#00f0ff]" />
              <p className="text-xs font-black text-[#00f0ff] uppercase tracking-[0.2em] font-mono">Código de Salida</p>
            </div>
            
            <CardContent className="p-8 flex flex-col items-center justify-center">
              {/* Holographic glowing QR Wrapper */}
              <div className="relative p-5 bg-white shadow-inner group overflow-hidden">
                {/* Scan laser line */}
                <div 
                  className="absolute left-1 right-1 h-0.5 bg-[#ff6b2c] shadow-[0_0_10px_#ff6b2c,0_0_20px_#ff6b2c] z-20"
                  style={{ animation: 'scan 2.8s ease-in-out infinite' }}
                />
                
                <QrCode className="w-44 h-44 text-[#0b1120] relative z-10 transition-transform duration-500 group-hover:scale-95" />
                
                {/* Subtly tint the QR code background */}
                <div className="absolute inset-0 bg-[#00f0ff]/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>
              </div>
              
              <p className="text-[#8892a4] text-xs mt-6 text-center leading-relaxed max-w-[280px] font-sans">
                Aproxima este código al lector óptico de la barrera para habilitar tu salida.
              </p>
            </CardContent>
          </Card>
        </BorderGlow>

        {/* Digital Billing Kiosk Card */}
        <Card className="w-full bg-card/60 backdrop-blur-md border-border shadow-2xl shadow-black/40 overflow-hidden relative">
          {/* Subtle tech border gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent"></div>
          
          <CardContent className="p-8 text-center flex flex-col items-center gap-6">
            
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-[#8892a4] uppercase tracking-[0.2em] flex items-center justify-center gap-1.5 font-mono">
                <Receipt className="w-3.5 h-3.5 text-[#00f0ff]" />
                Total a Abonar
              </p>
              
              {/* Digital Neon Price Display */}
              <h1 className="text-6xl font-black font-mono text-[#00f0ff] tracking-tight select-none drop-shadow-[0_0_15px_rgba(0,240,255,0.3)]">
                ${totalAmount.toLocaleString()}
              </h1>
              
              {billableHours > 0 && (
                <p className="text-xs text-[#8892a4] font-mono mt-1">
                  {billableHours === 0.5 ? "Media hora" : `${billableHours} hora${billableHours > 1 ? "s" : ""}`} × ${tarifaHora.toLocaleString()}/hora
                </p>
              )}
            </div>
            
            <div className="w-full border-t border-border pt-4 flex justify-between items-center text-xs text-[#8892a4]">
              <span className="font-sans">Tarifa plana por hora</span>
              <span className="font-mono text-[#e8ecf1]">${tarifaHora.toLocaleString()}/hora</span>
            </div>
          </CardContent>
        </Card>

        {/* Premium Payment Action Section */}
        <div className="w-full flex flex-col gap-4">
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-[#009EE3] to-[#00c6ff] hover:from-[#0089C5] hover:to-[#00b0ee] text-white shadow-xl shadow-[#009EE3]/15 transition-all duration-300 transform hover:-translate-y-0.5 border border-[#00f0ff]/20 active:translate-y-0 active:scale-98 font-sans"
          >
            <CreditCard className="w-5 h-5 mr-3 drop-shadow-md" />
            Pagar con Mercado Pago
          </Button>

          <Button 
            variant="ghost" 
            onClick={logout} 
            className="w-full h-12 text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/60 transition-all font-medium flex items-center justify-center gap-2 font-sans"
          >
            <LogOut className="w-4 h-4" />
            Salir del Sistema
          </Button>
        </div>
      </main>
    </div>
  );
};
