import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';
import { RoleRedirect } from './routes/RoleRedirect';
import { DashboardLayout } from './layouts/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/dashboard/AdminDashboard';
import { GerenteDashboard } from './pages/dashboard/GerenteDashboard';
import { CajeroDashboard } from './pages/dashboard/CajeroDashboard';
import { MeseroDashboard } from './pages/dashboard/MeseroDashboard';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ruta raíz → login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Ruta pública */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Rutas protegidas (requieren sesión activa) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout><RoleRedirect /></DashboardLayout>} path="/dashboard" />

            {/* Solo Admin */}
            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route
                path="/dashboard/admin"
                element={<DashboardLayout><AdminDashboard /></DashboardLayout>}
              />
            </Route>

            {/* Gerente y Admin */}
            <Route element={<RoleRoute allowedRoles={['admin', 'gerente']} />}>
              <Route
                path="/dashboard/gerente"
                element={<DashboardLayout><GerenteDashboard /></DashboardLayout>}
              />
            </Route>

            {/* Cajero y Admin */}
            <Route element={<RoleRoute allowedRoles={['admin', 'cajero']} />}>
              <Route
                path="/dashboard/cajero"
                element={<DashboardLayout><CajeroDashboard /></DashboardLayout>}
              />
            </Route>

            {/* Mesero y Admin */}
            <Route element={<RoleRoute allowedRoles={['admin', 'mesero']} />}>
              <Route
                path="/dashboard/mesero"
                element={<DashboardLayout><MeseroDashboard /></DashboardLayout>}
              />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
