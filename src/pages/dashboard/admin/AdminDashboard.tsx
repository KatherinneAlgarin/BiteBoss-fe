import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UtensilsCrossed, DollarSign, Settings } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard',     url: '/dashboard/admin',          icon: LayoutDashboard },
  { title: 'Usuarios',      url: '/dashboard/admin/usuarios', icon: Users },
  { title: 'Menú',          url: '/dashboard/admin/menu',     icon: UtensilsCrossed },
  { title: 'Caja',          url: '/dashboard/admin/caja',     icon: DollarSign },
  { title: 'Configuración', url: '/dashboard/admin/config',   icon: Settings },
];

export function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.profile) return null;

  return (
    <DashboardLayout
      user={{ name: user.profile.nombre, email: user.email, role: 'admin' }}
      data={{ navMain }}
      onLogout={() => { void logout().then(() => navigate('/login', { replace: true })); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
