import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, DollarSign } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/cajero',         icon: LayoutDashboard },
  { title: 'Órdenes',   url: '/dashboard/cajero/ordenes', icon: ClipboardList },
  { title: 'Caja',      url: '/dashboard/cajero/caja',    icon: DollarSign },
];

export function CajeroDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.profile) return null;

  return (
    <DashboardLayout
      user={{ name: user.profile.nombre, email: user.email, role: 'cajero' }}
      data={{ navMain }}
      onLogout={() => { void logout().then(() => navigate('/login', { replace: true })); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
