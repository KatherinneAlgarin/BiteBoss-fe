import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/mesero',         icon: LayoutDashboard },
  { title: 'Mis Mesas', url: '/dashboard/mesero/mesas',   icon: UtensilsCrossed },
  { title: 'Órdenes',   url: '/dashboard/mesero/ordenes', icon: ClipboardList },
];

export function MeseroDashboard() {
  const { session, logout } = useAuth();
  const meta = session?.user?.app_metadata;

  if (!session) return null;

  return (
    <DashboardLayout
      user={{ name: meta?.nombre ?? '', email: session.user.email ?? '', role: 'mesero' }}
      data={{ navMain }}
      onLogout={() => { void logout(); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
