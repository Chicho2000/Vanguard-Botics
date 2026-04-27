import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Car, Lock, Mail, CreditCard, Loader2 } from "lucide-react";

export const Login: React.FC = () => {
  const { login, loginInvitado, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [activeTab, setActiveTab] = useState<"usuario" | "invitado">("usuario");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [patente, setPatente] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from?.pathname;

  // Redirección si ya está autenticado
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.rol === "ADMIN") navigate("/admin", { replace: true });
        else if (user.rol === "CLIENTE") navigate("/cliente", { replace: true });
        else if (user.rol === "INVITADO") navigate("/invitado", { replace: true });
      }
    }
  }, [isAuthenticated, navigate, user, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      if (activeTab === "usuario") {
        if (!email || !password) {
          setError("Completá todos los campos");
          return;
        }
        await login(email, password);
      } else {
        if (!patente) {
          setError("Ingresá la patente del vehículo");
          return;
        }
        await loginInvitado(patente);
      }
    } catch (err: any) {
      setError(err.message || "Error al autenticar");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 overflow-hidden relative font-sans">
      {/* Background animated gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[35vw] h-[35vw] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[45vw] h-[45vw] bg-indigo-600 rounded-full mix-blend-multiply filter blur-[100px] opacity-30 animate-blob animation-delay-4000"></div>

      <div className="z-10 w-full max-w-md p-8 m-4 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-cyan-400 to-blue-600 p-4 rounded-2xl shadow-lg mb-4">
            <Car className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-300">
            Vanguard Botics
          </h1>
          <p className="text-slate-400 mt-2 text-sm text-center">
            Sistema de Estacionamiento Inteligente
          </p>
        </div>

        <div className="flex bg-slate-800/50 p-1 rounded-xl mb-6">
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "usuario"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => { setActiveTab("usuario"); setError(""); }}
          >
            Usuario
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
              activeTab === "invitado"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-400 hover:text-white"
            }`}
            onClick={() => { setActiveTab("invitado"); setError(""); }}
          >
            Invitado
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          {activeTab === "usuario" ? (
            <>
              <div>
                <label className="block text-slate-300 text-sm mb-2 font-medium">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-500"
                    placeholder="ejemplo@correo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm mb-2 font-medium">Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-slate-300 text-sm mb-2 font-medium">Patente del Vehículo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={patente}
                  onChange={(e) => setPatente(e.target.value.toUpperCase())}
                  className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all placeholder-slate-500 uppercase tracking-widest font-mono text-center"
                  placeholder="AB 123 CD"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transform transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              activeTab === "usuario" ? "Ingresar a la Plataforma" : "Acceso Rápido"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
