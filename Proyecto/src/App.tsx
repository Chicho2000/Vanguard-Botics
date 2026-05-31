import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { MapaAdmin } from './pages/MapaAdmin';
import { ConfiguracionAdmin } from './pages/ConfiguracionAdmin';
import { UsuariosAdmin } from './pages/UsuariosAdmin';
import { DashboardCliente } from './pages/DashboardCliente';
import { DashboardInvitado } from './pages/DashboardInvitado';


const basename = window.location.pathname.startsWith('/~')
  ? `/${window.location.pathname.split('/')[1]}`
  : '/';

function App() {
  return (
    <AuthProvider>
      <Router basename={basename}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <DashboardAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/mapa" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <MapaAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/usuarios" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <UsuariosAdmin />
            </ProtectedRoute>
          } />

          <Route path="/admin/configuracion" element={
            <ProtectedRoute allowedRoles={["ADMIN"]}>
              <ConfiguracionAdmin />
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
