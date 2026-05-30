import { Outlet } from 'react-router-dom';
import { UserCircle, CalendarDays, ReceiptText } from 'lucide-react';
import { DashboardLayout } from '../../../components/dashboard/DashboardLayout';
import { useAuth } from '../../../hooks/useAuth';

const navMain = [
  { title: 'Reservaciones', url: '/dashboard/mesero/reservaciones', icon: CalendarDays },
  { title: 'Pedidos en vivo', url: '/dashboard/mesero/pedidos-en-vivo', icon: ReceiptText },
  { title: 'Perfil',          url: '/dashboard/profile',                icon: UserCircle },
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
