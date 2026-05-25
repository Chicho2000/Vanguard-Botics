import React from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Clock, CreditCard, MapPin, QrCode, LogOut, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const DashboardCliente: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#080c14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.08),rgba(255,255,255,0))] text-[#f1f5f9] flex flex-col font-sans">
      <Navbar />
      
      {/* Laser Scanning Animation Styles Injection */}
      <style>{`
        @keyframes scan {
          0%, 100% { top: 4%; }
          50% { top: 96%; }
        }
      `}</style>

      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-8 flex flex-col gap-8 z-10">
        
        {/* Futuristic Welcome Header */}
        <div className="text-center space-y-2 mt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 border border-sky-500/25 rounded-full text-[11px] font-semibold text-sky-400 uppercase tracking-widest mb-1 shadow-sm">
            <Zap className="w-3.5 h-3.5" />
            Acceso Autorizado
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight">
            Hola, <span className="bg-gradient-to-r from-sky-400 to-cyan-300 bg-clip-text text-transparent">{user?.nombre}</span>
          </h2>
          <p className="text-slate-400 text-sm">Pase rápido inteligente y monitoreo en tiempo real</p>
        </div>

        {/* Laser Scanning Holographic QR Card */}
        <Card className="border-sky-500/30 bg-[#0f172a]/60 backdrop-blur-md overflow-hidden relative shadow-2xl shadow-sky-500/5">
          {/* Neon Top Edge Accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-500 to-cyan-400"></div>
          
          <div className="bg-slate-900/60 px-4 py-3 text-center border-b border-slate-800/80 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <p className="text-xs font-black text-sky-400 uppercase tracking-[0.2em]">Pase Digital de Barrera</p>
          </div>
          
          <CardContent className="p-8 flex flex-col items-center justify-center">
            {/* Holographic glowing QR Wrapper */}
            <div className="relative p-5 bg-white rounded-2xl shadow-inner group overflow-hidden">
              {/* Scan laser line */}
              <div 
                className="absolute left-1 right-1 h-0.5 bg-emerald-500 shadow-[0_0_10px_#10b981,0_0_20px_#10b981] z-20"
                style={{ animation: 'scan 2.8s ease-in-out infinite' }}
              />
              
              <QrCode className="w-44 h-44 text-[#080c14] relative z-10 transition-transform duration-500 group-hover:scale-95" />
              
              {/* Subtly tint the QR code image background for depth */}
              <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition duration-300"></div>
            </div>
            
            <p className="text-slate-400 text-xs mt-6 text-center leading-relaxed max-w-[280px]">
              Aproxima este código al lector óptico de la barrera para habilitar tu paso de forma automatizada.
            </p>
          </CardContent>
        </Card>

        {/* Tactical Real-time Status Section */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-[#0f172a]/40 border-slate-800/70 hover:border-emerald-500/30 transition duration-300">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2.5 relative">
              {/* Telemetry Blinking LED */}
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              
              <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <MapPin className="w-6 h-6 text-emerald-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Lugar Asignado</p>
              <p className="font-mono font-black text-lg text-emerald-400">Piso 1 - A12</p>
            </CardContent>
          </Card>
          
          <Card className="bg-[#0f172a]/40 border-slate-800/70 hover:border-sky-500/30 transition duration-300">
            <CardContent className="p-5 flex flex-col items-center justify-center text-center gap-2.5 relative">
              <span className="absolute top-3 right-3 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
              </span>

              <div className="p-2.5 bg-sky-500/10 rounded-xl border border-sky-500/20">
                <Clock className="w-6 h-6 text-sky-400" />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estancia Activa</p>
              <p className="font-mono font-black text-lg text-sky-400">02:15 hs</p>
            </CardContent>
          </Card>
        </div>

        {/* Premium Monthly Membership Subscription */}
        <Card className="bg-[#0f172a]/60 backdrop-blur-md border-slate-800/80 shadow-xl">
          <CardHeader className="pb-3 pt-6 px-6">
            <CardTitle className="text-base font-black uppercase tracking-wider flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/15 rounded-lg border border-indigo-500/20">
                <CreditCard className="w-4 h-4 text-indigo-400" />
              </div>
              Abono Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-800/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-sm text-slate-200">Plan Premium VIP</span>
                  <Badge className="bg-indigo-500/15 text-indigo-400 border-indigo-500/20 font-mono text-[9px] uppercase font-bold py-0">Activo</Badge>
                </div>
                <p className="text-xs text-slate-400">Vence en 14 días (Renovación automática)</p>
              </div>
              <Button 
                variant="outline" 
                className="h-9 px-4 border-indigo-500/40 text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-lg transition-all duration-300 font-semibold text-xs"
              >
                Renovar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sign Out Action */}
        <Button 
          variant="ghost" 
          onClick={logout} 
          className="text-rose-400/90 hover:text-rose-300 hover:bg-rose-950/15 mx-auto mt-4 rounded-xl transition duration-300 font-semibold flex items-center gap-2 text-xs"
        >
          <LogOut className="w-4 h-4" />
          Cerrar Sesión Segura
        </Button>
      </main>
    </div>
  );
};
