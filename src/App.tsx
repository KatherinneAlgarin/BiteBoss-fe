import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { RoleRedirect } from './components/auth/RoleRedirect';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard';
import { CajeroDashboard } from './pages/dashboard/cajero/CajeroDashboard';
import { MeseroDashboard } from './pages/dashboard/mesero/MeseroDashboard';
import { CocineroDashboard } from './pages/dashboard/cocinero/CocineroDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<RoleRedirect />} />

              <Route element={<RoleRoute allowedRoles={['admin']} />}>
                <Route path="/dashboard/admin" element={<AdminDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'cajero']} />}>
                <Route path="/dashboard/cajero" element={<CajeroDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'mesero']} />}>
                <Route path="/dashboard/mesero" element={<MeseroDashboard />} />
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'cocinero']} />}>
                <Route path="/dashboard/cocinero" element={<CocineroDashboard />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
