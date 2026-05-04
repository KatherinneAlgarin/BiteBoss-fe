import { useAuthContext } from '../context/AuthContext';
import type { UserRole } from '../types/auth.types';

export function useAuth() {
  return useAuthContext();
}

export function useRole(): UserRole | null {
  const { user } = useAuthContext();
  return user?.profile?.role ?? null;
}

export function useHasRole(...roles: UserRole[]): boolean {
  const role = useRole();
  return role !== null && roles.includes(role);
}
