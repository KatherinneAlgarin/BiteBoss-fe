import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleRoute } from './components/auth/RoleRoute';
import { RoleRedirect } from './components/auth/RoleRedirect';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { ProfilePage } from './pages/dashboard/ProfilePage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './pages/dashboard/admin/AdminDashboard';
import { AdminHome } from './pages/dashboard/admin/AdminHome';
import { UsuariosPage } from './pages/dashboard/admin/UsuariosPage';
import { ProveedoresPage } from './pages/dashboard/admin/ProveedoresPage';
import { MenuPage } from './pages/dashboard/admin/MenuPage';
import { InventarioPage } from './pages/dashboard/admin/InventarioPage';
import { TiposOrdenPage } from './pages/dashboard/admin/TiposOrdenPage';
import { TiposPagoPage } from './pages/dashboard/admin/TiposPagoPage';
import { CategoriasPage } from './pages/dashboard/admin/CategoriasPage';
import { KPIsPage as KPIsAdminPage } from './pages/dashboard/admin/KPIsPage';
import { KPIsPage as KPIsGerentePage } from './pages/dashboard/gerente/KPIsPage';
import { SucursalesPage } from './pages/dashboard/admin/SucursalesPage';
import { ZonasMesasPage } from './pages/dashboard/admin/ZonasMesasPage';
import { BodegasAdminPage } from './pages/dashboard/admin/BodegasPage';
import { BodegasGerentePage } from './pages/dashboard/gerente/BodegasPage';
import { IngredientesAdminPage } from './pages/dashboard/admin/IngredientesPage';
import { IngredientesGerentePage } from './pages/dashboard/gerente/IngredientesPage';
import { PedidosProveedorPage } from './pages/dashboard/admin/PedidosProveedorPage';
import { PedidosProveedorPage as PedidosProveedorGerentePage } from './pages/dashboard/gerente/PedidosProveedorPage';
import { ProveedoresPage as ProveedoresGerentePage } from './pages/dashboard/gerente/ProveedoresPage';
import { CajeroDashboard } from './pages/dashboard/cajero/CajeroDashboard';
import { CajeroHome } from './pages/dashboard/cajero/CajeroHome';
import { POSPage } from './pages/dashboard/cajero/POSPage';
import { MeseroDashboard } from './pages/dashboard/mesero/MeseroDashboard';
import { MeseroHome } from './pages/dashboard/mesero/MeseroHome';
import { GerenteDashboard } from './pages/dashboard/gerente/GerenteDashboard';
import { GerenteHome } from './pages/dashboard/gerente/GerenteHome';
import { ReservacionesPage } from './pages/dashboard/reservaciones/ReservacionesPage';
// Import diagnostics for development
import './lib/api-diagnostics';

function App() {
  return (
    <ErrorBoundary>
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
                  <Route index element={<KPIsAdminPage />} />
                  <Route path="usuarios" element={<UsuariosPage />} />
                  <Route path="proveedores" element={<ProveedoresPage />} />
                  <Route path="menu" element={<MenuPage />} />
                  <Route path="inventario" element={<InventarioPage />} />
                  <Route path="tipos-orden" element={<TiposOrdenPage />} />
                  <Route path="tipos-pago" element={<TiposPagoPage />} />
                  <Route path="sucursales" element={<SucursalesPage />} />
                  <Route path="zonas-mesas" element={<ZonasMesasPage />} />
                  <Route path="bodegas" element={<BodegasAdminPage />} />
                  <Route path="ingredientes" element={<IngredientesAdminPage />} />
                  <Route path="pedidos-proveedor" element={<PedidosProveedorPage />} />
                  <Route path="categorias" element={<CategoriasPage />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'cajero']} />}>
                <Route path="/dashboard/cajero" element={<CajeroDashboard />}>
                  <Route index element={<POSPage />} />
                  <Route path="ordenes" element={<POSPage />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'mesero']} />}>
                <Route path="/dashboard/mesero" element={<MeseroDashboard />}>
                  <Route index element={<ReservacionesPage />} />
                  <Route path="reservaciones" element={<ReservacionesPage />} />
                </Route>
              </Route>

              <Route element={<RoleRoute allowedRoles={['admin', 'gerente']} />}>
                <Route path="/dashboard/gerente" element={<GerenteDashboard />}>
                  <Route index element={<KPIsGerentePage />} />
                  <Route path="inventario" element={<InventarioPage />} />
                  <Route path="reservaciones" element={<ReservacionesPage />} />
                  <Route path="bodegas" element={<BodegasGerentePage />} />
                  <Route path="ingredientes" element={<IngredientesGerentePage />} />
                  <Route path="proveedores" element={<ProveedoresGerentePage />} />
                  <Route path="pedidos-proveedor" element={<PedidosProveedorGerentePage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
