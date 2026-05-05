import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth.types';

const ROLE_HOME: Record<UserRole, string> = {
  admin:    '/dashboard/admin',
  cajero:   '/dashboard/cajero',
  mesero:   '/dashboard/mesero',
  cocinero: '/dashboard/cocinero',
};

export function RoleRedirect() {
  const { role } = useAuth();
  if (!role || !(role in ROLE_HOME)) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_HOME[role]} replace />;
}
