import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/admin.service";
import { 
  Users, CreditCard, Loader2, AlertCircle, 
  LayoutDashboard, Map, Settings, LogOut,
  Save, Check, Info, Sliders, Cpu
} from "lucide-react";
import VanguardCarIcon from "../components/ui/VanguardCarIcon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Dock from "@/components/ui/Dock";
import type { DockItemData } from "@/components/ui/Dock";
import { getErrorMessage } from "../lib/validation";

export const ConfiguracionAdmin: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"general" | "tarifas" | "limites" | "sistema">("general");

  useEffect(() => {
    document.documentElement.classList.add("admin-active");
    return () => {
      document.documentElement.classList.remove("admin-active");
    };
  }, []);

  useEffect(() => {
    async function loadConfigs() {
      try {
        setLoading(true);
        setError("");
        const data = await adminService.getConfigs();
        setConfigs(data);
      } catch (err: unknown) {
        setError(getErrorMessage(err, "Error al cargar las configuraciones"));
      } finally {
        setLoading(false);
      }
    }
    loadConfigs();
  }, []);

  const handleChange = (key: string, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggle = (key: string) => {
    setConfigs(prev => ({
      ...prev,
      [key]: prev[key] === "true" ? "false" : "true"
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");
      const updated = await adminService.updateConfigs(configs);
      setConfigs(updated);
      setSuccessMessage("Configuraciones guardadas y propagadas con éxito");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Error al guardar las configuraciones"));
    } finally {
      setSaving(false);
    }
  };

  const dockItems: DockItemData[] = [
    { icon: <LayoutDashboard size={18} className="text-[#00f0ff]" />, label: 'Dashboard', onClick: () => navigate("/admin") },
    { icon: <Map size={18} className="text-[#00f0ff]" />, label: 'Mapa', onClick: () => navigate("/admin/mapa") },
    { icon: <Users size={18} className="text-[#00f0ff]" />, label: 'Usuarios', onClick: () => navigate("/admin/usuarios") },
    { icon: <Settings size={18} className="text-[#00f0ff]" />, label: 'Config', onClick: () => navigate("/admin/configuracion") },
    { icon: <LogOut size={18} className="text-[#f43f5e]" />, label: 'Salir', onClick: logout },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-12 h-12 text-[#00f0ff] animate-spin drop-shadow-[0_0_8px_rgba(0,240,255,0.5)]" />
          <span className="text-xs font-semibold text-[#8892a4] uppercase tracking-[0.2em] animate-pulse font-mono">Estableciendo Enlace de Configuración...</span>
        </div>
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20 font-bold text-sm shadow-[0_0_12px_rgba(0,240,255,0.08)] text-left cursor-pointer"
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
            <h1 className="text-lg font-black uppercase tracking-[0.15em] text-[#e8ecf1]">Parámetros del Sistema</h1>
          </div>
        </header>

        {/* Scrollable Work Area */}
        <div className="flex-1 overflow-auto p-8 pb-24 space-y-8">
          
          {/* Messages Alert Banners */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-semibold select-none shadow-md shadow-rose-950/20">
              <AlertCircle className="w-5 h-5 flex-shrink-0 drop-shadow-[0_0_4px_rgba(244,63,94,0.4)]" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-semibold select-none shadow-md shadow-emerald-950/20">
              <Check className="w-5 h-5 flex-shrink-0 drop-shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Custom Tab Switcher */}
            <div className="flex border border-border bg-card/40 backdrop-blur-md p-1.5 select-none w-fit">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer ${
                  activeTab === "general"
                    ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shadow-inner"
                    : "text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/30"
                }`}
              >
                <Info size={14} />
                General
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("tarifas")}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer ${
                  activeTab === "tarifas"
                    ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shadow-inner"
                    : "text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/30"
                }`}
              >
                <CreditCard size={14} />
                Tarifas
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("limites")}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer ${
                  activeTab === "limites"
                    ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shadow-inner"
                    : "text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/30"
                }`}
              >
                <Sliders size={14} />
                Límites
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("sistema")}
                className={`flex items-center gap-2 px-5 py-2.5 font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer ${
                  activeTab === "sistema"
                    ? "bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] shadow-inner"
                    : "text-[#8892a4] hover:text-[#e8ecf1] hover:bg-secondary/30"
                }`}
              >
                <Cpu size={14} />
                Sistema
              </button>
            </div>

            {/* Config Forms Grid */}
            <Card className="border border-border bg-card/60 backdrop-blur-md shadow-2xl">
              <CardHeader className="px-6 pt-5 pb-2 border-b border-border bg-background/20">
                <CardTitle className="text-base font-extrabold text-[#e8ecf1] flex items-center gap-2 uppercase tracking-wide">
                  {activeTab === "general" && <><Info className="text-[#00f0ff]" size={18} /> Configuración de Metadata General</>}
                  {activeTab === "tarifas" && <><CreditCard className="text-[#00f0ff]" size={18} /> Matriz de Tarifas & Abonos</>}
                  {activeTab === "limites" && <><Sliders className="text-[#00f0ff]" size={18} /> Tolerancias & Parámetros Físicos</>}
                  {activeTab === "sistema" && <><Cpu className="text-[#00f0ff]" size={18} /> Preferencias del Motor de Telemetría</>}
                </CardTitle>
                <CardDescription className="text-xs text-[#8892a4] font-mono">
                  {activeTab === "general" && "Defina los datos identificatorios de la cochera visible para los usuarios finales."}
                  {activeTab === "tarifas" && "Configure los valores de cobros por hora y los abonos mensuales, diarios y anuales."}
                  {activeTab === "limites" && "Defina las cotas físicas estructurales que la barrera inteligente validará al ingresar autos."}
                  {activeTab === "sistema" && "Active simuladores e integre servicios opcionales del core backend."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                
                {/* 1. GENERAL TAB */}
                {activeTab === "general" && (
                  <div className="space-y-6 max-w-2xl">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Nombre de la Cochera</label>
                      <input 
                        type="text"
                        value={configs.parking_name || ""}
                        onChange={(e) => handleChange("parking_name", e.target.value)}
                        className="w-full h-11 px-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-semibold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none placeholder:text-muted-foreground/30 font-mono"
                        placeholder="Nombre de la estación..."
                        required
                      />
                      <p className="text-xs text-[#8892a4] font-mono">Visible en la barra lateral del sistema y recibos de pagos.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Mensaje de Bienvenida</label>
                      <textarea
                        value={configs.welcome_message || ""}
                        onChange={(e) => handleChange("welcome_message", e.target.value)}
                        className="w-full min-h-[90px] p-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-semibold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none placeholder:text-muted-foreground/30 font-mono resize-none"
                        placeholder="Mensaje a mostrar..."
                        required
                      />
                      <p className="text-xs text-[#8892a4] font-mono">Mensaje de cabecera visualizado por los invitados y clientes al ingresar al portal.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Teléfono de Soporte y Consultas</label>
                      <input 
                        type="text"
                        value={configs.support_phone || ""}
                        onChange={(e) => handleChange("support_phone", e.target.value)}
                        className="w-full h-11 px-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-semibold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none placeholder:text-muted-foreground/30 font-mono"
                        placeholder="+54 11 0000-0000"
                        required
                      />
                      <p className="text-xs text-[#8892a4] font-mono">Número telefónico mostrado en caso de fallos de barrera o tickets de reclamo.</p>
                    </div>
                  </div>
                )}

                {/* 2. TARIFAS TAB */}
                {activeTab === "tarifas" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Tarifa por Hora (Invitados)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00f0ff] font-mono">$</span>
                        <input 
                          type="number"
                          value={configs.rate_hourly || ""}
                          onChange={(e) => handleChange("rate_hourly", e.target.value)}
                          className="w-full h-11 pl-8 pr-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Costo base aplicado por hora (o fracción) para autos sin abono registrado.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Precio Abono Diario</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00f0ff] font-mono">$</span>
                        <input 
                          type="number"
                          value={configs.rate_daily || ""}
                          onChange={(e) => handleChange("rate_daily", e.target.value)}
                          className="w-full h-11 pl-8 pr-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Costo del pase ilimitado válido por 24 horas consecutivas.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Precio Abono Mensual</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00f0ff] font-mono">$</span>
                        <input 
                          type="number"
                          value={configs.rate_monthly || ""}
                          onChange={(e) => handleChange("rate_monthly", e.target.value)}
                          className="w-full h-11 pl-8 pr-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Abono mensual estándar para cocheras fijas de clientes registrados.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Precio Abono Trimestral</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00f0ff] font-mono">$</span>
                        <input 
                          type="number"
                          value={configs.rate_quarterly || ""}
                          onChange={(e) => handleChange("rate_quarterly", e.target.value)}
                          className="w-full h-11 pl-8 pr-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Abono trimestral estándar (cada 3 meses) para clientes registrados.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Precio Abono Anual</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#00f0ff] font-mono">$</span>
                        <input 
                          type="number"
                          value={configs.rate_yearly || ""}
                          onChange={(e) => handleChange("rate_yearly", e.target.value)}
                          className="w-full h-11 pl-8 pr-4 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Abono corporativo anual con descuento especial ya integrado.</p>
                    </div>
                  </div>
                )}

                {/* 3. LIMITES TAB */}
                {activeTab === "limites" && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Altura Máxima Estructural</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={configs.limit_max_height || ""}
                          onChange={(e) => handleChange("limit_max_height", e.target.value)}
                          className="w-full h-11 pl-4 pr-12 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8892a4] font-mono">cm</span>
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Gálibo físico. Alturas superiores bloquean la entrada al instante.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Ancho Máximo del Carril</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={configs.limit_max_width || ""}
                          onChange={(e) => handleChange("limit_max_width", e.target.value)}
                          className="w-full h-11 pl-4 pr-12 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8892a4] font-mono">cm</span>
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Anchura máxima física del carril de entrada sensores OCR.</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#8892a4] uppercase tracking-wider font-mono">Carga Máxima por Eje</label>
                      <div className="relative">
                        <input 
                          type="number"
                          value={configs.limit_max_weight || ""}
                          onChange={(e) => handleChange("limit_max_weight", e.target.value)}
                          className="w-full h-11 pl-4 pr-12 bg-[#0a0c12]/40 border border-border text-[#e8ecf1] font-bold text-sm transition duration-300 focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff]/30 outline-none font-mono"
                          required
                          min="0"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8892a4] font-mono">kg</span>
                      </div>
                      <p className="text-xs text-[#8892a4] font-mono">Resistencia de la losa estructural de planta baja.</p>
                    </div>
                  </div>
                )}

                {/* 4. SISTEMA TAB */}
                {activeTab === "sistema" && (
                  <div className="space-y-6 max-w-2xl divide-y divide-border/40">
                    
                    {/* Simulated Barriers Toggle */}
                    <div className="flex items-center justify-between pb-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#e8ecf1] uppercase tracking-wider font-mono">Simulación de Barreras Automáticas</label>
                        <p className="text-xs text-[#8892a4] font-mono max-w-lg leading-relaxed">
                          Si está activo, las barreras virtuales de entrada y salida se abrirán automáticamente simulando el paso de telemetría de patentes sin hardware físico.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("sim_barrier")}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 flex-shrink-0 cursor-pointer ${
                          configs.sim_barrier === "true" ? "bg-[#00f0ff]/20 border border-[#00f0ff]" : "bg-[#141820] border border-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                            configs.sim_barrier === "true" ? "translate-x-6 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" : "bg-[#8892a4]"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Email Notifications Toggle */}
                    <div className="flex items-center justify-between py-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#e8ecf1] uppercase tracking-wider font-mono">Notificaciones de Ticket por Email</label>
                        <p className="text-xs text-[#8892a4] font-mono max-w-lg leading-relaxed">
                          Envía automáticamente resúmenes de pago y estados de abonos mensuales vencidos a los correos electrónicos registrados de los clientes.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("notify_email")}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 flex-shrink-0 cursor-pointer ${
                          configs.notify_email === "true" ? "bg-[#00f0ff]/20 border border-[#00f0ff]" : "bg-[#141820] border border-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                            configs.notify_email === "true" ? "translate-x-6 bg-[#00f0ff] shadow-[0_0_8px_#00f0ff]" : "bg-[#8892a4]"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Maintenance Mode Toggle */}
                    <div className="flex items-center justify-between pt-5 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-rose-400 uppercase tracking-wider font-mono">Modo Mantenimiento Global</label>
                        <p className="text-xs text-rose-400/70 font-mono max-w-lg leading-relaxed">
                          Al activarse, suspende todas las operaciones automáticas de barreras y muestra un aviso de mantenimiento técnico en los portales web de clientes e invitados.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggle("maintenance_mode")}
                        className={`w-12 h-6 flex items-center rounded-full p-1 transition duration-300 flex-shrink-0 cursor-pointer ${
                          configs.maintenance_mode === "true" ? "bg-rose-500/20 border border-rose-500" : "bg-[#141820] border border-border"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full shadow-md transform transition duration-300 ${
                            configs.maintenance_mode === "true" ? "translate-x-6 bg-rose-500 shadow-[0_0_8px_#f43f5e]" : "bg-[#8892a4]"
                          }`}
                        />
                      </button>
                    </div>

                  </div>
                )}

              </CardContent>
            </Card>

            {/* glowing Form Submit Actions */}
            <div className="flex justify-end select-none">
              <button
                type="submit"
                disabled={saving}
                className="h-12 px-8 bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 border border-[#00f0ff]/40 text-[#00f0ff] font-bold text-xs uppercase tracking-widest transition duration-300 shadow-[0_0_15px_rgba(0,240,255,0.15)] hover:shadow-[0_0_25px_rgba(0,240,255,0.3)] disabled:opacity-50 disabled:pointer-events-none flex items-center gap-3 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Propagando Parámetros...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </>
                )}
              </button>
            </div>
            
          </form>

        </div>

        {/* Floating Dock — Quick Actions */}
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
