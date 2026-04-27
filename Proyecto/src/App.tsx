import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function DashboardAdmin() {
  return <div className="min-h-screen bg-slate-900 p-8 text-white"><h1 className="text-3xl font-bold">Panel de Administración</h1><p className="text-slate-400 mt-4">Acceso exclusivo para administradores.</p></div>;
}

function DashboardCliente() {
  return <div className="min-h-screen bg-slate-900 p-8 text-white"><h1 className="text-3xl font-bold">Mi Panel</h1><p className="text-slate-400 mt-4">Gestión de cuenta y vehículos.</p></div>;
}

function DashboardInvitado() {
  return <div className="min-h-screen bg-slate-900 p-8 text-white"><h1 className="text-3xl font-bold">Acceso por Patente</h1><p className="text-slate-400 mt-4">Estado de la sesión activa de estacionamiento.</p></div>;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />
          
          <Route path="/cliente" element={
            <ProtectedRoute allowedRoles={["CLIENTE"]}>
              <DashboardCliente />
            </ProtectedRoute>
          } />
          
          <Route path="/invitado" element={
            <ProtectedRoute allowedRoles={["INVITADO"]}>
              <DashboardInvitado />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App;
