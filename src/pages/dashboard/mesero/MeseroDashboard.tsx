import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, UserCircle, CalendarDays } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard',     url: '/dashboard/mesero',               icon: LayoutDashboard },
  { title: 'Reservaciones', url: '/dashboard/mesero/reservaciones', icon: CalendarDays },
  { title: 'Mis Mesas',     url: '/dashboard/mesero/mesas',         icon: UtensilsCrossed },
  { title: 'Órdenes',       url: '/dashboard/mesero/ordenes',       icon: ClipboardList },
  { title: 'Perfil',        url: '/dashboard/profile',              icon: UserCircle },
];

export function MeseroDashboard() {
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
