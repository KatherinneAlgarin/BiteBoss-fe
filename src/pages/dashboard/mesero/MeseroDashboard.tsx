import { Outlet } from 'react-router-dom';
import { UserCircle, ClipboardPlus, BellRing } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Tomar orden', url: '/dashboard/mesero/tomar-orden', icon: ClipboardPlus },
  { title: 'Pedidos a mesa', url: '/dashboard/mesero/pedidos-mesa', icon: BellRing },
  { title: 'Perfil', url: '/dashboard/profile', icon: UserCircle },
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
