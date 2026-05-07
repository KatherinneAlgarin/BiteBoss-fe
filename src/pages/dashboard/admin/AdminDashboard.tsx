import { Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, DollarSign, UserCircle } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/admin',          icon: LayoutDashboard },
  { title: 'Usuarios',  url: '/dashboard/admin/usuarios', icon: Users },
  { title: 'Menú',      url: '/dashboard/admin/menu',     icon: UtensilsCrossed },
  { title: 'Caja',      url: '/dashboard/admin/caja',     icon: DollarSign },
  { title: 'Perfil',    url: '/dashboard/profile',        icon: UserCircle },
];

export function AdminDashboard() {
  const { session, logout, displayName } = useAuth();

  if (!session) return null;

  return (
    <DashboardLayout
      user={{ name: displayName, email: session.user.email ?? '', role: 'admin' }}
      data={{ navMain }}
      onLogout={logout}
    >
      <Outlet />
    </DashboardLayout>
  );
}
