import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, UserCircle, CalendarDays } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard',     url: '/dashboard/gerente',               icon: LayoutDashboard },
  { title: 'Reservaciones', url: '/dashboard/gerente/reservaciones', icon: CalendarDays },
  { title: 'Menú',          url: '/dashboard/gerente/menu',          icon: UtensilsCrossed },
  { title: 'Órdenes',       url: '/dashboard/gerente/ordenes',       icon: ClipboardList },
  { title: 'Perfil',        url: '/dashboard/profile',               icon: UserCircle },
];

export function GerenteDashboard() {
  const { session, logout, displayName } = useAuth();

  if (!session) return null;

  return (
    <DashboardLayout
      user={{ name: displayName, email: session.user.email ?? '', role: 'gerente' }}
      data={{ navMain }}
      onLogout={logout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
