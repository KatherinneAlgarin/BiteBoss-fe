import { Outlet } from 'react-router-dom';
import { ClipboardList, DollarSign, UserCircle } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Órdenes', url: '/dashboard/cajero/ordenes', icon: ClipboardList },
  { title: 'Caja',    url: '/dashboard/cajero/caja',    icon: DollarSign },
  { title: 'Perfil',  url: '/dashboard/profile',        icon: UserCircle },
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
