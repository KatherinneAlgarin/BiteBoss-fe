import { Outlet } from 'react-router-dom';
import { UserCircle, Package, CalendarDays, Warehouse, FlaskConical, BarChart2, TrendingUp, Truck, ShoppingCart, Building2, ReceiptText } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'KPIs',         url: '/dashboard/gerente',               icon: TrendingUp },
  { title: 'Reservaciones', url: '/dashboard/gerente/reservaciones', icon: CalendarDays },
  {
    title: 'Almacén',
    icon: Package,
    children: [
      { title: 'Ingredientes', url: '/dashboard/gerente/ingredientes', icon: FlaskConical },
      { title: 'Bodegas',      url: '/dashboard/gerente/bodegas',      icon: Warehouse },
      { title: 'Inventario',   url: '/dashboard/gerente/inventario',   icon: BarChart2 },
    ],
  },
  {
    title: 'Proveedores',
    icon: Truck,
    children: [
      { title: 'Gestor Proveedor',  url: '/dashboard/gerente/proveedores',       icon: Building2 },
      { title: 'Órdenes de compra', url: '/dashboard/gerente/pedidos-proveedor', icon: ShoppingCart },
    ],
  },
  { title: 'Cortes Caja', url: '/dashboard/gerente/cortes-caja', icon: ReceiptText },
  { title: 'Perfil',  url: '/dashboard/profile',         icon: UserCircle },
];

export function GerenteDashboard() {
  const { session, logout, displayName, role } = useAuth();

  if (!session || !role) return null;

  return (
    <DashboardLayout
      user={{ name: displayName, email: session.user.email ?? '', role }}
      data={{ navMain }}
      onLogout={logout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
