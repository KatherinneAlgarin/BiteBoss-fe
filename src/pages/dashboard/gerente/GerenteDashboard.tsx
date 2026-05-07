import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed, UserCircle } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/gerente',          icon: LayoutDashboard },
  { title: 'Menú',      url: '/dashboard/gerente/menu',     icon: UtensilsCrossed },
  { title: 'Órdenes',   url: '/dashboard/gerente/ordenes',  icon: ClipboardList },
  { title: 'Perfil',    url: '/dashboard/profile',           icon: UserCircle },
];

export function GerenteDashboard() {
  const { session, logout } = useAuth();
  const meta = session?.user?.app_metadata;

  if (!session) return null;

  return (
    <DashboardLayout
      user={{ name: meta?.nombre ?? '', email: session.user.email ?? '', role: 'gerente' }}
      data={{ navMain }}
      onLogout={() => { void logout(); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
