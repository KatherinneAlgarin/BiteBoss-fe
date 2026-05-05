import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, useHasRole } from '../../hooks/useAuth';
import type { UserRole } from '../../types/auth.types';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const { isAuthenticated } = useAuth();
  const hasRole = useHasRole(...allowedRoles);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasRole) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
