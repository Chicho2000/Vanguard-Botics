import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Login } from './components/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardAdmin } from './pages/DashboardAdmin';
import { DashboardCliente } from './pages/DashboardCliente';
import { DashboardInvitado } from './pages/DashboardInvitado';

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
