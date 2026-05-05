import type { Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'cajero' | 'mesero' | 'cocinero';

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
