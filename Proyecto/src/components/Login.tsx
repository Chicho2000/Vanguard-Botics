import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Car, Lock, User } from 'lucide-react';
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

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [patente, setPatente] = useState('');
  
  // Register specific states
  const [regNombre, setRegNombre] = useState('');
  const [regTelefono, setRegTelefono] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (activeTab === 'login') {
        await login(email, password);
        // After login, AuthContext updates state. We need to redirect.
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
        setSuccess('¡Registro exitoso! Redirigiendo...');
        setTimeout(() => navigate('/cliente'), 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Error en la autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Visual Render */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-muted">
        <img 
          src="/parking_render.png" 
          alt="Automated Parking Facility" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay for blending */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 to-background"></div>
        <div className="absolute bottom-12 left-12 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary p-3 rounded-xl shadow-lg shadow-primary/30">
              <Car className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-extrabold text-foreground">Vanguard Botics</h1>
          </div>
          <p className="text-xl text-muted-foreground font-medium">
            Sistema de Estacionamiento Inteligente de Próxima Generación.
          </p>
        </div>
      </div>

      {/* Right Side - Forms */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Bienvenido</h2>
            <p className="text-muted-foreground">
              Ingresá tus credenciales o operá como invitado
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val as TabType); setError(''); setSuccess(''); }} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="registro">Registrar</TabsTrigger>
              <TabsTrigger value="invitado">Invitado</TabsTrigger>
            </TabsList>

            {error && (
              <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm font-medium">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="admin@chumi.com" 
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Contraseña</Label>
                    <a href="#" className="text-sm font-medium text-primary hover:underline">
                      ¿Olvidaste tu contraseña?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                </Button>
              </TabsContent>

              <TabsContent value="registro" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-nombre">Nombre Completo</Label>
                    <Input 
                      id="reg-nombre" 
                      placeholder="Juan Pérez" 
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-tel">Teléfono</Label>
                    <Input 
                      id="reg-tel" 
                      placeholder="+54 9 11 1234-5678" 
                      value={regTelefono}
                      onChange={(e) => setRegTelefono(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input 
                    id="reg-email" 
                    type="email" 
                    placeholder="tucorreo@ejemplo.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass">Contraseña</Label>
                    <Input 
                      id="reg-pass" 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-pass-confirm">Repetir Contraseña</Label>
                    <Input 
                      id="reg-pass-confirm" 
                      type="password" 
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-6" disabled={loading}>
                  {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
                </Button>
              </TabsContent>

              <TabsContent value="invitado" className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-medium">Acceso Rápido</h3>
                  <p className="text-sm text-muted-foreground">
                    Ingresá tu patente para ver el estado de tu vehículo y pagar.
                  </p>
                </div>
                <div className="space-y-2">
                  <Input 
                    id="patente" 
                    placeholder="Ej: AB 123 CD" 
                    className="text-center text-2xl uppercase tracking-widest h-16 font-bold"
                    value={patente}
                    onChange={(e) => setPatente(e.target.value.toUpperCase())}
                    maxLength={8}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full h-14 text-lg bg-green-600 hover:bg-green-700 text-white" disabled={loading}>
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
