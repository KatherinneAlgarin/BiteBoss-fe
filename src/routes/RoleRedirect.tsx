import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  gerente: '/dashboard/gerente',
  cajero: '/dashboard/cajero',
  mesero: '/dashboard/mesero',
};

export function RoleRedirect() {
  const { user } = useAuth();
  const role = user?.profile?.role;

  if (!role) return <Navigate to="/unauthorized" replace />;

  return <Navigate to={ROLE_HOME[role]} replace />;
}
