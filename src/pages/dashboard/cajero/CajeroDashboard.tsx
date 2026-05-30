import { Outlet } from 'react-router-dom';
import { Store, UserCircle } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Caja', url: '/dashboard/cajero/caja', icon: Store },
  { title: 'Perfil', url: '/dashboard/profile', icon: UserCircle },
];

export function CajeroDashboard() {
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
