import React from "react";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Clock, CreditCard, MapPin, QrCode, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const DashboardCliente: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">
            Hola, <span className="text-primary">{user?.nombre}</span>
          </h2>
          <p className="text-muted-foreground text-sm">Tu pase rápido y estado en tiempo real</p>
        </div>

        {/* Giant QR Code Section */}
        <Card className="border-primary/50 shadow-lg shadow-primary/20 bg-card overflow-hidden">
          <div className="bg-primary/10 p-4 text-center border-b border-border">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Pase de Barrera</p>
          </div>
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <div className="bg-white p-6 rounded-2xl shadow-inner">
              <QrCode className="w-48 h-48 text-slate-900" />
            </div>
            <p className="text-muted-foreground text-sm mt-6 text-center">
              Acercá este código al lector de la barrera para ingresar o salir automáticamente.
            </p>
          </CardContent>
        </Card>

        {/* Status Section */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <MapPin className="w-8 h-8 text-emerald-500 mb-1" />
              <p className="text-sm text-muted-foreground">Ubicación</p>
              <p className="font-bold">Piso 1 - A12</p>
            </CardContent>
          </Card>
          
          <Card className="bg-card">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <Clock className="w-8 h-8 text-blue-500 mb-1" />
              <p className="text-sm text-muted-foreground">Tiempo</p>
              <p className="font-bold">02:15 hs</p>
            </CardContent>
          </Card>
        </div>

        {/* Subscriptions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-violet-500" />
              Tu Abono Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Plan Premium</p>
                <p className="text-sm text-muted-foreground">Vence en 14 días</p>
              </div>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Renovar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Button variant="ghost" onClick={logout} className="text-destructive hover:bg-destructive/10 mx-auto mt-4">
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar Sesión
        </Button>
      </main>
    </div>
  );
};
