import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type TabType = 'login' | 'registro' | 'invitado';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, register: contextRegister, loginInvitado } = useAuth();

  // States
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string>('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patente, setPatente] = useState('');

  // Register specific states
  const [regNombre, setRegNombre] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  // Color configuration depending on the selected active tab
  const getThemeColors = () => {
    switch (activeTab) {
      case 'login':
        return {
          glow: 'border-sky-500/20 shadow-[0_0_50px_-12px_rgba(56,189,248,0.18)]',
          topBar: 'bg-sky-500 shadow-[0_1px_10px_rgba(56,189,248,0.5)]',
          inputFocus: 'focus-visible:ring-sky-500/35 focus-visible:border-sky-500/50',
          button: 'bg-sky-500 hover:bg-sky-400 text-slate-950 hover:shadow-sky-500/25 hover:shadow-lg',
          icon: 'text-sky-400',
          textAccent: 'text-sky-400',
        };
      case 'registro':
        return {
          glow: 'border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.18)]',
          topBar: 'bg-indigo-500 shadow-[0_1px_10px_rgba(99,102,241,0.5)]',
          inputFocus: 'focus-visible:ring-indigo-500/35 focus-visible:border-indigo-500/50',
          button: 'bg-indigo-500 hover:bg-indigo-400 text-slate-950 hover:shadow-indigo-500/25 hover:shadow-lg',
          icon: 'text-indigo-400',
          textAccent: 'text-indigo-400',
        };
      case 'invitado':
        return {
          glow: 'border-emerald-500/20 shadow-[0_0_50px_-12px_rgba(16,185,129,0.18)]',
          topBar: 'bg-emerald-500 shadow-[0_1px_10px_rgba(16,185,129,0.5)]',
          inputFocus: 'focus-visible:ring-emerald-500/35 focus-visible:border-emerald-500/50',
          button: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/25 hover:shadow-lg',
          icon: 'text-emerald-400',
          textAccent: 'text-emerald-400',
        };
    }
  };

  const colors = getThemeColors();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          navigate(u.rol === 'ADMIN' ? '/admin' : '/cliente');
        } else {
          navigate('/dashboard');
        }
      } else if (activeTab === 'invitado') {
        if (patente.length < 6) throw new Error('Patente inválida');
        await loginInvitado(patente);
        navigate('/invitado', { state: { patente } });
      } else if (activeTab === 'registro') {
        if (password !== regPasswordConfirm) {
          throw new Error('Las contraseñas no coinciden');
        }
        await contextRegister(email, password, regNombre, regTelefono);
        setSuccess('¡Registro exitoso! Iniciando sesión...');
        setTimeout(() => navigate('/cliente'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-background text-foreground font-sans">

      {/* Left Side - Pure CSS Neon Telemetry Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#080c14] flex-col justify-between p-12">
        
        {/* Technical Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Breathtaking Glowing Ambient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-sky-500/10 blur-[90px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-indigo-500/10 blur-[120px]"></div>
        <div className="absolute top-1/2 right-1/3 w-72 h-72 rounded-full bg-emerald-500/5 blur-[100px] animate-[pulse_6s_ease-in-out_infinite]"></div>

        {/* Concentric pulsing telemetry rings (Radar/Sonar effect) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
          <div className="relative w-96 h-96 flex items-center justify-center">
            {/* Pulsing outer ring */}
            <div className="absolute w-[400px] h-[400px] rounded-full border border-sky-500/10 animate-[ping_4s_linear_infinite] shadow-[0_0_20px_rgba(56,189,248,0.02)]"></div>
            {/* Middle decorative ring */}
            <div className="absolute w-80 h-80 rounded-full border border-cyan-500/15 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]"></div>
            {/* Inner dashed navigation ring */}
            <div className="absolute w-60 h-60 rounded-full border border-indigo-500/20 border-dashed animate-[spin_40s_linear_infinite]"></div>
            {/* Concentric center core - Syncs with active tab */}
            <div className={`absolute w-36 h-36 rounded-full border transition-all duration-500 ${
              activeTab === 'login' ? 'border-sky-500/10 bg-sky-500/5' :
              activeTab === 'registro' ? 'border-indigo-500/10 bg-indigo-500/5' :
              'border-emerald-500/10 bg-emerald-500/5'
            }`}></div>
            <div className={`absolute w-3 h-3 rounded-full transition-all duration-500 shadow-[0_0_12px_currentColor] animate-pulse ${
              activeTab === 'login' ? 'bg-sky-400 text-sky-400' :
              activeTab === 'registro' ? 'bg-indigo-400 text-indigo-400' :
              'bg-emerald-400 text-emerald-400'
            }`}></div>
          </div>
        </div>

        {/* Bottom Branding (Z-index active) - Syncs with active tab */}
        <div className="absolute bottom-12 left-12 max-w-md z-10 space-y-3.5">
          <div className="flex items-center gap-3.5">
            <div className={`border p-3 rounded-2xl shadow-lg transition-all duration-500 ${
              activeTab === 'login' ? 'bg-sky-500/10 border-sky-500/25 shadow-sky-500/5' :
              activeTab === 'registro' ? 'bg-indigo-500/10 border-indigo-500/25 shadow-indigo-500/5' :
              'bg-emerald-500/10 border-emerald-500/25 shadow-emerald-500/5'
            }`}>
              <Car className={`w-8 h-8 transition-colors duration-500 ${colors.textAccent} drop-shadow-[0_0_50px_rgba(0,0,0,0.15)]`} />
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black tracking-widest uppercase bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.15)] ${
              activeTab === 'login' ? 'from-sky-400 to-cyan-300 drop-shadow-[0_0_10px_rgba(56,189,248,0.25)]' :
              activeTab === 'registro' ? 'from-indigo-400 to-violet-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.25)]' :
              'from-emerald-400 to-teal-300 drop-shadow-[0_0_10px_rgba(16,185,129,0.25)]'
            }`}>Vanguard Botics</h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wide leading-relaxed">
            Sistema de Estacionamiento Inteligente de Próxima Generación.
          </p>
        </div>
      </div>

      {/* Right Side - Refined Clean Form Panel wrapped in Compact Neon-Glow Glassmorphic Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-background relative z-10">
        <div className={`w-full max-w-md h-[485px] bg-[#0a0f1d]/50 backdrop-blur-xl border rounded-[1.5rem] p-5 sm:p-7 shadow-2xl relative overflow-hidden transition-all duration-500 ${colors.glow}`}>
          {/* Top-edge dynamic neon accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${colors.topBar}`}></div>

          {/* Header */}
          <div className="flex flex-col mb-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-100 transition-colors duration-500">
              {activeTab === 'login' && 'Iniciar Sesión'}
              {activeTab === 'registro' && 'Crear Cuenta'}
              {activeTab === 'invitado' && 'Acceso Invitado'}
            </h2>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => { setActiveTab(val as TabType); setError(''); setSuccess(''); }}
            className="w-full"
          >
            {/* Clean Modern Tabs Header */}
            <TabsList className="grid w-full grid-cols-3 mb-5 bg-slate-950/40 border border-slate-900/80 p-1 rounded-xl h-10">
              <TabsTrigger 
                value="login" 
                className={`rounded-lg text-xs font-bold transition duration-300 border border-transparent ${
                  activeTab === 'login' 
                    ? 'data-active:bg-sky-500/15 data-active:text-sky-400 data-active:border-sky-500/30' 
                    : 'hover:text-slate-300'
                }`}
              >
                Ingresar
              </TabsTrigger>
              <TabsTrigger 
                value="registro" 
                className={`rounded-lg text-xs font-bold transition duration-300 border border-transparent ${
                  activeTab === 'registro' 
                    ? 'data-active:bg-indigo-500/15 data-active:text-indigo-400 data-active:border-indigo-500/30' 
                    : 'hover:text-slate-300'
                }`}
              >
                Registrar
              </TabsTrigger>
              <TabsTrigger 
                value="invitado" 
                className={`rounded-lg text-xs font-bold transition duration-300 border border-transparent ${
                  activeTab === 'invitado' 
                    ? 'data-active:bg-emerald-500/15 data-active:text-emerald-400 data-active:border-emerald-500/30' 
                    : 'hover:text-slate-300'
                }`}
              >
                Invitado
              </TabsTrigger>
            </TabsList>

            {/* Error alerts */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold shadow-inner transition-all duration-300">
                {error}
              </div>
            )}

            {/* Success alerts */}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold shadow-inner transition-all duration-300">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Login Tab */}
              <TabsContent value="login" className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@chumi.com"
                      className={`pl-9 h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña</Label>
                    <a href="#" className={`text-[10px] font-bold transition-colors duration-300 hover:underline ${colors.textAccent}`}>
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`pl-9 pr-10 h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" className={`w-full h-10 mt-4 text-sm font-bold rounded-xl transition duration-300 shadow-md ${colors.button}`} disabled={loading}>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="registro" className="space-y-2.5">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-nombre" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo</Label>
                    <Input
                      id="reg-nombre"
                      placeholder="Juan Pérez"
                      className={`h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-tel" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Teléfono</Label>
                    <Input
                      id="reg-tel"
                      placeholder="+54 9 11 1234-5678"
                      className={`h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reg-email" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    className={`h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="reg-pass" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contraseña</Label>
                    <Input
                      id="reg-pass"
                      type="password"
                      placeholder="Min. 6 carac."
                      className={`h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="reg-pass-confirm" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirmar</Label>
                    <Input
                      id="reg-pass-confirm"
                      type="password"
                      placeholder="Repetir..."
                      className={`h-10 bg-slate-950/20 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className={`w-full h-10 mt-3 text-sm font-bold rounded-xl transition duration-300 shadow-md ${colors.button}`} disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </TabsContent>

              {/* Guest Tab */}
              <TabsContent value="invitado" className="space-y-5">
                <div className="text-center space-y-1.5 max-w-[280px] mx-auto">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">Acceso Rápido</h3>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ingresá la patente de tu auto para verificar el estado y abonar tu tiempo.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Input
                    id="patente"
                    placeholder="AB 123 CD"
                    className={`text-center text-2xl uppercase tracking-widest h-12 font-mono font-black bg-slate-950/25 border-slate-800 focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none rounded-xl transition duration-300 ${colors.inputFocus}`}
                    value={patente}
                    onChange={(e) => setPatente(e.target.value.toUpperCase())}
                    maxLength={8}
                    required
                  />
                </div>

                <Button type="submit" size="lg" className={`w-full h-10 text-sm font-bold rounded-xl transition duration-300 shadow-md ${colors.button}`} disabled={loading}>
                  Buscar Vehículo
                </Button>
              </TabsContent>
            </form>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
