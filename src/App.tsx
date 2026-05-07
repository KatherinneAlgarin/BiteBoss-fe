import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { RoleRedirect } from './components/auth/RoleRedirect';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard';
import { AdminHome } from './pages/dashboard/admin/AdminHome';
import { UsuariosPage } from './pages/dashboard/admin/UsuariosPage';
import { CajeroDashboard } from './pages/dashboard/cajero/CajeroDashboard';
import { CajeroHome } from './pages/dashboard/cajero/CajeroHome';
import { MeseroDashboard } from './pages/dashboard/mesero/MeseroDashboard';
import { MeseroHome } from './pages/dashboard/mesero/MeseroHome';
import { CocineroDashboard } from './pages/dashboard/cocinero/CocineroDashboard';
import { CocineroHome } from './pages/dashboard/cocinero/CocineroHome';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="/dashboard" element={<RoleRedirect />} />
            <Route path="/dashboard/profile" element={<ProfilePage />} />

            <Route element={<RoleRoute allowedRoles={['admin']} />}>
              <Route path="/dashboard/admin" element={<AdminDashboard />}>
                <Route index element={<AdminHome />} />
                <Route path="usuarios" element={<UsuariosPage />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'cajero']} />}>
              <Route path="/dashboard/cajero" element={<CajeroDashboard />}>
                <Route index element={<CajeroHome />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'mesero']} />}>
              <Route path="/dashboard/mesero" element={<MeseroDashboard />}>
                <Route index element={<MeseroHome />} />
              </Route>
            </Route>

            <Route element={<RoleRoute allowedRoles={['admin', 'cocinero']} />}>
              <Route path="/dashboard/cocinero" element={<CocineroDashboard />}>
                <Route index element={<CocineroHome />} />
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
