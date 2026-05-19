import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, UserCircle, Package, CalendarDays, Warehouse, FlaskConical, BarChart2 } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard',     url: '/dashboard/gerente',               icon: LayoutDashboard },
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
  { title: 'Menú',    url: '/dashboard/gerente/menu',    icon: UtensilsCrossed },
  { title: 'Órdenes', url: '/dashboard/gerente/ordenes', icon: ClipboardList },
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
