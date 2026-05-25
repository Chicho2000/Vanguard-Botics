import React from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Car, Clock, CreditCard, LogOut, Receipt } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const DashboardInvitado: React.FC = () => {
  const { user, logout } = useAuth();

  // Mocking an active session with a balance to pay.
  const balanceToPay = 1250;
  const timeElapsed = "2h 30m";

  return (
    <div className="min-h-screen bg-[#080c14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.08),rgba(255,255,255,0))] text-[#f1f5f9] flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full px-5 py-12 flex flex-col items-center justify-center gap-8 z-10">
        
        {/* Patente Banner (Futuristic Physical Plate Simulation) */}
        <div className="text-center w-full space-y-4">
          <div className="relative group">
            {/* Ambient Cyan Halo Backlight Glow */}
            <div className="absolute -inset-1.5 bg-gradient-to-r from-sky-500 to-cyan-400 rounded-2xl blur-xl opacity-35 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            
            {/* The Plate Frame */}
            <div className="relative bg-[#0d1527] border-2 border-sky-500/40 rounded-2xl px-6 py-5 shadow-2xl flex flex-col items-center gap-2">
              {/* Plate Header Decal */}
              <div className="flex justify-between w-full text-[9px] font-mono uppercase tracking-[0.25em] text-sky-400/60 border-b border-sky-950/50 pb-1.5 mb-1.5">
                <span>Vanguard Botics</span>
                <span>Smart Parking</span>
              </div>
              
              <div className="flex items-center gap-4">
                <Car className="w-8 h-8 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
                <span className="text-4xl md:text-5xl font-mono font-black tracking-[0.15em] text-sky-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.6)]">
                  {user?.patente || "AB123CD"}
                </span>
              </div>
            </div>
          </div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Sesión Activa</span>
          </div>
        </div>

        {/* Digital Billing Kiosk Card */}
        <Card className="w-full bg-[#0f172a]/60 backdrop-blur-md border-slate-800/80 shadow-2xl shadow-black/40 overflow-hidden relative">
          {/* Subtle tech border gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-sky-500 to-transparent"></div>
          
          <CardContent className="p-8 text-center flex flex-col items-center gap-6">
            
            {/* Clock elapsed widget */}
            <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-300">
              <Clock className="w-5 h-5 text-sky-400" />
              <span className="font-semibold text-sm font-mono tracking-wide">Tiempo Transcurrido: {timeElapsed}</span>
            </div>
            
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] flex items-center justify-center gap-1.5">
                <Receipt className="w-3.5 h-3.5 text-sky-400" />
                Total a Abonar
              </p>
              
              {/* Digital Neon Price Display */}
              <h1 className="text-6xl font-black font-mono text-emerald-400 tracking-tight select-none drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                ${balanceToPay}
              </h1>
            </div>
            
            <div className="w-full border-t border-slate-800/50 pt-4 flex justify-between items-center text-xs text-slate-400">
              <span>Tarifa plana por hora</span>
              <span className="font-mono text-slate-300">$500/hora</span>
            </div>
          </CardContent>
        </Card>

        {/* Premium Payment Action Section */}
        <div className="w-full flex flex-col gap-4">
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-bold bg-gradient-to-r from-[#009EE3] to-[#00c6ff] hover:from-[#0089C5] hover:to-[#00b0ee] text-white rounded-2xl shadow-xl shadow-[#009EE3]/15 transition-all duration-300 transform hover:-translate-y-0.5 border border-sky-400/20 active:translate-y-0 active:scale-98"
          >
            <CreditCard className="w-5 h-5 mr-3 drop-shadow-md" />
            Pagar con Mercado Pago
          </Button>

          <Button 
            variant="ghost" 
            onClick={logout} 
            className="w-full h-12 text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 rounded-xl transition-all font-medium flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Salir del Sistema
          </Button>
        </div>
      </main>
    </div>
  );
};
