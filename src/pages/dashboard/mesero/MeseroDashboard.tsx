import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/mesero',         icon: LayoutDashboard },
  { title: 'Mis Mesas', url: '/dashboard/mesero/mesas',   icon: UtensilsCrossed },
  { title: 'Órdenes',   url: '/dashboard/mesero/ordenes', icon: ClipboardList },
];

export function MeseroDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.profile) return null;

  return (
    <DashboardLayout
      user={{ name: user.profile.nombre, email: user.email, role: 'mesero' }}
      data={{ navMain }}
      onLogout={() => { void logout().then(() => navigate('/login', { replace: true })); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
