import { Outlet } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, DollarSign, UserCircle } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/cajero',         icon: LayoutDashboard },
  { title: 'Órdenes',   url: '/dashboard/cajero/ordenes', icon: ClipboardList },
  { title: 'Caja',      url: '/dashboard/cajero/caja',    icon: DollarSign },
  { title: 'Perfil',    url: '/dashboard/profile',        icon: UserCircle },
];

export function CajeroDashboard() {
  const { session, logout } = useAuth();
  const meta = session?.user?.app_metadata;

  if (!session) return null;

  return (
    <DashboardLayout
      user={{ name: meta?.nombre ?? '', email: session.user.email ?? '', role: 'cajero' }}
      data={{ navMain }}
      onLogout={() => { void logout(); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
