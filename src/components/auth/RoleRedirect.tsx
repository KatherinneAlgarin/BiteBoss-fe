import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth.types';

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/dashboard/admin',
  cajero: '/dashboard/cajero',
  mesero: '/dashboard/mesero',
  cocinero: '/dashboard/cocinero',
};

export function RoleRedirect() {
  const { user } = useAuth();
  const role = user?.profile?.role;
  if (!role) return <Navigate to="/unauthorized" replace />;
  return <Navigate to={ROLE_HOME[role]} replace />;
}
