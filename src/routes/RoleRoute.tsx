import { Navigate, Outlet } from 'react-router-dom';
import { useHasRole } from '../hooks/useAuth';
import type { UserRole } from '../types/auth';

interface RoleRouteProps {
  allowedRoles: UserRole[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
  const hasRole = useHasRole(...allowedRoles);

  if (!hasRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
