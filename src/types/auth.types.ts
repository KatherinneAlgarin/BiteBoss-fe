import type { Session } from '@supabase/supabase-js';

export const USER_ROLES = ['admin', 'cajero', 'mesero', 'gerente'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface UserProfile {
  id_usuario: number;
  nombre: string;
  email: string;
  activo: boolean;
  role: UserRole;
  id_rol: number;
  id_sucursal: number;
  id_usuario_sucursal: number;
}

export interface AuthState {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
}
