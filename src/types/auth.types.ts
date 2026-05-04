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

export interface AuthUser {
  id: string;
  email: string;
  profile: UserProfile | null;
}

export interface AuthState {
  user: AuthUser | null;
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
