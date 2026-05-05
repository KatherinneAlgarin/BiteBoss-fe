import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, UtensilsCrossed } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Dashboard', url: '/dashboard/cocinero',         icon: LayoutDashboard },
  { title: 'Menú',      url: '/dashboard/cocinero/menu',    icon: UtensilsCrossed },
  { title: 'Órdenes',   url: '/dashboard/cocinero/ordenes', icon: ClipboardList },
];

export function CocineroDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user?.profile) return null;

  return (
    <DashboardLayout
      user={{ name: user.profile.nombre, email: user.email, role: 'cocinero' }}
      data={{ navMain }}
      onLogout={() => { void logout().then(() => navigate('/login', { replace: true })); }}
    >
      <Outlet />
    </DashboardLayout>
  );
}
