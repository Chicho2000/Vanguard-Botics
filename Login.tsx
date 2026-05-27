import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BorderGlow from "@/components/ui/BorderGlow";
import parkingRender from "../../public/parking_render.png";

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
          glow: 'border-[#00f0ff]/20 shadow-[0_0_50px_-12px_rgba(0,240,255,0.18)]',
          topBar: 'bg-[#00f0ff] shadow-[0_1px_10px_rgba(0,240,255,0.5)]',
          inputFocus: 'focus-visible:ring-[#00f0ff]/35 focus-visible:border-[#00f0ff]/50',
          button: 'bg-[#00f0ff] hover:bg-[#33f3ff] text-[#050508] hover:shadow-[#00f0ff]/25 hover:shadow-lg',
          icon: 'text-[#00f0ff]',
          textAccent: 'text-[#00f0ff]',
          glowColors: ['#00f0ff', '#00b8d4', '#a855f7'] as string[],
        };
      case 'registro':
        return {
          glow: 'border-indigo-500/20 shadow-[0_0_50px_-12px_rgba(99,102,241,0.18)]',
          topBar: 'bg-indigo-500 shadow-[0_1px_10px_rgba(99,102,241,0.5)]',
          inputFocus: 'focus-visible:ring-indigo-500/35 focus-visible:border-indigo-500/50',
          button: 'bg-indigo-500 hover:bg-indigo-400 text-[#050508] hover:shadow-indigo-500/25 hover:shadow-lg',
          icon: 'text-indigo-400',
          textAccent: 'text-indigo-400',
          glowColors: ['#6366f1', '#a855f7', '#00f0ff'] as string[],
        };
      case 'invitado':
        return {
          glow: 'border-[#ff6b2c]/20 shadow-[0_0_50px_-12px_rgba(255,107,44,0.18)]',
          topBar: 'bg-[#ff6b2c] shadow-[0_1px_10px_rgba(255,107,44,0.5)]',
          inputFocus: 'focus-visible:ring-[#ff6b2c]/35 focus-visible:border-[#ff6b2c]/50',
          button: 'bg-[#ff6b2c] hover:bg-[#ff8a56] text-[#050508] hover:shadow-[#ff6b2c]/25 hover:shadow-lg',
          icon: 'text-[#ff6b2c]',
          textAccent: 'text-[#ff6b2c]',
          glowColors: ['#ff6b2c', '#f59e0b', '#00f0ff'] as string[],
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden flex bg-transparent text-foreground font-sans">

      {/* Left Side - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-cover bg-center flex-col justify-between p-12" style={{ backgroundImage: `url(${parkingRender})` }}>

        {/* Dark Gradient Overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>

        {/* Bottom Branding - Syncs with active tab */}
        <div className="absolute bottom-12 left-12 max-w-md z-10 space-y-3.5">
          <div className="flex items-center gap-3.5">
            <div className={`border p-3 shadow-lg transition-all duration-500 ${activeTab === 'login' ? 'bg-[#00f0ff]/10 border-[#00f0ff]/25 shadow-[#00f0ff]/5' :
              activeTab === 'registro' ? 'bg-indigo-500/10 border-indigo-500/25 shadow-indigo-500/5' :
                'bg-[#ff6b2c]/10 border-[#ff6b2c]/25 shadow-[#ff6b2c]/5'
              }`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 34 32"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-9 h-9 transition-colors duration-500 ${colors.textAccent} drop-shadow-[0_0_10px_currentColor]`}
              >
                {/* Aggressive Car Body Silhouette */}
                <path d="M 31 17 L 24 14 L 18 10 L 12 10 L 6 13 L 2 14 L 2 21 L 4 21" />
                <path d="M 12 21 L 20 21" />
                <path d="M 28 21 L 30 21 L 31 17" />

                {/* Sleek Angular Side Window */}
                <path d="M 18 10 L 23 14 L 8 14 L 12 10 Z" />

                {/* Cyberpunk Racing Number "67" */}
                <g strokeWidth="0.8">
                  <path d="M 15.5 15 L 13.5 15 L 12.5 19 L 14.5 19 L 15 17 L 13 17" />
                  <path d="M 16.5 15 L 18.5 15 L 17.5 19" />
                </g>

                {/* Massive Cyberpunk Rear Spoiler */}
                <path d="M 6 13 L 4 8 L 10 8 L 12 10" />

                {/* Front Splitter & Rear Diffuser */}
                <line x1="27" y1="22" x2="33" y2="22" />
                <line x1="1" y1="22" x2="5" y2="22" />

                {/* Headlight & Taillight Slits */}
                <path d="M 28 15 L 31 16" strokeWidth="2" />
                <path d="M 2 15 L 4 15" strokeWidth="2" />

                {/* Futuristic Crosshair Wheels */}
                <circle cx="8" cy="21" r="3.5" />
                <circle cx="8" cy="21" r="1" />
                <line x1="4.5" y1="21" x2="11.5" y2="21" />
                <line x1="8" y1="17.5" x2="8" y2="24.5" />

                <circle cx="24" cy="21" r="3.5" />
                <circle cx="24" cy="21" r="1" />
                <line x1="20.5" y1="21" x2="27.5" y2="21" />
                <line x1="24" y1="17.5" x2="24" y2="24.5" />
              </svg>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-light tracking-[0.3em] uppercase bg-gradient-to-r bg-clip-text text-transparent transition-all duration-500 drop-shadow-[0_0_10px_rgba(0,0,0,0.15)] ${activeTab === 'login' ? 'from-[#00f0ff] to-cyan-300 drop-shadow-[0_0_10px_rgba(0,240,255,0.25)]' :
              activeTab === 'registro' ? 'from-indigo-400 to-violet-300 drop-shadow-[0_0_10px_rgba(99,102,241,0.25)]' :
                'from-[#ff6b2c] to-amber-300 drop-shadow-[0_0_10px_rgba(255,107,44,0.25)]'
              }`}>Vanguard Botics</h1>
          </div>
          <p className="text-[11px] text-[#8892a4] font-semibold tracking-wide leading-relaxed font-mono uppercase">
            Sistema de Estacionamiento Inteligente // Próxima Generación
          </p>
        </div>
      </div>

      {/* Right Side - Form Panel wrapped in BorderGlow */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 bg-transparent relative z-10">
        <BorderGlow
          borderRadius={0}
          backgroundColor="#0a0c12"
          glowColor="185 100 50"
          glowIntensity={0.8}
          colors={colors.glowColors}
          edgeSensitivity={25}
          className="w-full max-w-md"
        >
          <div className={`h-[485px] p-5 sm:p-7 relative overflow-hidden transition-all duration-500`}>
            {/* Top-edge dynamic neon accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 transition-all duration-500 ${colors.topBar}`}></div>

            {/* Header */}
            <div className="flex flex-col mb-4">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#e8ecf1] transition-colors duration-500">
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
              {/* Tabs Header */}
              <TabsList className="grid w-full grid-cols-3 mb-5 bg-background/60 border border-border p-1 h-10">
                <TabsTrigger
                  value="login"
                  className={`text-xs font-bold tracking-wider transition duration-300 border border-transparent ${activeTab === 'login'
                    ? 'data-active:bg-[#00f0ff]/15 data-active:text-[#00f0ff] data-active:border-[#00f0ff]/30'
                    : 'hover:text-[#e8ecf1]'
                    }`}
                >
                  Ingresar
                </TabsTrigger>
                <TabsTrigger
                  value="registro"
                  className={`text-xs font-bold tracking-wider transition duration-300 border border-transparent ${activeTab === 'registro'
                    ? 'data-active:bg-indigo-500/15 data-active:text-indigo-400 data-active:border-indigo-500/30'
                    : 'hover:text-[#e8ecf1]'
                    }`}
                >
                  Registrar
                </TabsTrigger>
                <TabsTrigger
                  value="invitado"
                  className={`text-xs font-bold tracking-wider transition duration-300 border border-transparent ${activeTab === 'invitado'
                    ? 'data-active:bg-[#ff6b2c]/15 data-active:text-[#ff6b2c] data-active:border-[#ff6b2c]/30'
                    : 'hover:text-[#e8ecf1]'
                    }`}
                >
                  Invitado
                </TabsTrigger>
              </TabsList>

              {/* Error alerts */}
              {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-[11px] font-bold shadow-inner transition-all duration-300">
                  {error}
                </div>
              )}

              {/* Success alerts */}
              {success && (
                <div className="mb-4 p-3 bg-[#ff6b2c]/10 border border-[#ff6b2c]/20 text-[#ff6b2c] text-[11px] font-bold shadow-inner transition-all duration-300">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit}>

                {/* Login Tab */}
                <TabsContent value="login" className="space-y-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-[#8892a4]/60" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="admin@vanguard.io"
                        className={`pl-9 h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Contraseña</Label>
                      <a href="#" className={`text-[10px] font-bold transition-colors duration-300 hover:underline ${colors.textAccent}`}>
                        ¿Olvidaste tu contraseña?
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-[#8892a4]/60" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-9 pr-10 h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-[#8892a4]/60 hover:text-[#e8ecf1] transition"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className={`w-full h-10 mt-4 text-sm font-bold tracking-wider transition duration-300 shadow-md ${colors.button}`} disabled={loading}>
                    {loading ? 'Ingresando...' : 'INICIAR SESIÓN'}
                  </Button>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="registro" className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="reg-nombre" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Nombre Completo</Label>
                      <Input
                        id="reg-nombre"
                        placeholder="Juan Pérez"
                        className={`h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                        value={regNombre}
                        onChange={(e) => setRegNombre(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reg-tel" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Teléfono</Label>
                      <Input
                        id="reg-tel"
                        placeholder="+54 9 11 1234-5678"
                        className={`h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                        value={regTelefono}
                        onChange={(e) => setRegTelefono(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="reg-email" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="tucorreo@ejemplo.com"
                      className={`h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="reg-pass" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Contraseña</Label>
                      <Input
                        id="reg-pass"
                        type="password"
                        placeholder="Min. 6 carac."
                        className={`h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="reg-pass-confirm" className="text-[10px] font-bold text-[#8892a4] uppercase tracking-[0.15em] font-mono">Confirmar</Label>
                      <Input
                        id="reg-pass-confirm"
                        type="password"
                        placeholder="Repetir..."
                        className={`h-10 bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className={`w-full h-10 mt-3 text-sm font-bold tracking-wider transition duration-300 shadow-md ${colors.button}`} disabled={loading}>
                    {loading ? 'Creando cuenta...' : 'CREAR CUENTA'}
                  </Button>
                </TabsContent>

                {/* Guest Tab */}
                <TabsContent value="invitado" className="space-y-5">
                  <div className="text-center space-y-1.5 max-w-[280px] mx-auto">
                    <h3 className="text-sm font-extrabold uppercase tracking-[0.2em] text-[#e8ecf1]">Acceso Rápido</h3>
                    <p className="text-[11px] text-[#8892a4] leading-relaxed">
                      Ingresá la patente de tu auto para verificar el estado y abonar tu tiempo.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <Input
                      id="patente"
                      placeholder="AB 123 CD"
                      className={`text-center text-2xl uppercase tracking-[0.2em] h-12 font-mono font-black bg-background/40 border-border focus-visible:ring-offset-0 focus-visible:ring-2 focus-visible:outline-none transition duration-300 ${colors.inputFocus}`}
                      value={patente}
                      onChange={(e) => setPatente(e.target.value.toUpperCase())}
                      maxLength={8}
                      required
                    />
                  </div>

                  <Button type="submit" size="lg" className={`w-full h-10 text-sm font-bold tracking-wider transition duration-300 shadow-md ${colors.button}`} disabled={loading}>
                    BUSCAR VEHÍCULO
                  </Button>
                </TabsContent>
              </form>
            </Tabs>
          </div>
        </BorderGlow>
      </div>
    </div>
  );
};
