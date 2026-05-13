import { Navbar } from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Car, Clock, CreditCard, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const DashboardInvitado: React.FC = () => {
  const { user, logout } = useAuth();

  // Mocking an active session with a balance to pay.
  // In a real scenario, this would come from the API.
  const balanceToPay = 1250;
  const timeElapsed = "2h 30m";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-md mx-auto w-full px-4 py-12 flex flex-col items-center justify-center gap-8">
        
        {/* Patente Banner */}
        <div className="text-center w-full">
          <div className="inline-flex items-center gap-4 bg-primary/10 border border-primary/20 rounded-2xl px-8 py-4 mb-2 shadow-lg shadow-primary/5">
            <Car className="w-8 h-8 text-primary" />
            <span className="text-4xl font-mono font-black tracking-widest text-primary">
              {user?.patente || "AB123CD"}
            </span>
          </div>
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold mt-4">Sesión Activa</p>
        </div>

        {/* Balance Card */}
        <Card className="w-full bg-card border-border shadow-xl">
          <CardContent className="p-8 text-center flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-2">
              <Clock className="w-5 h-5" />
              <span className="font-medium text-lg">Tiempo transcurrido: {timeElapsed}</span>
            </div>
            
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Total a Pagar</p>
            <h1 className="text-6xl font-black text-emerald-500 mb-2">${balanceToPay}</h1>
            
            <p className="text-sm text-muted-foreground">Tarifa plana de $500/hora</p>
          </CardContent>
        </Card>

        {/* Mercado Pago Button */}
        <Button 
          size="lg" 
          className="w-full h-16 text-lg font-bold bg-[#009EE3] hover:bg-[#0089C5] text-white shadow-lg shadow-[#009EE3]/20"
        >
          <CreditCard className="w-6 h-6 mr-3" />
          Pagar con Mercado Pago
        </Button>

        <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:bg-secondary/50 mt-4">
          <LogOut className="w-4 h-4 mr-2" />
          Salir
        </Button>
      </main>
    </div>
  );
};
