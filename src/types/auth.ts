export type UserRole = 'admin' | 'gerente' | 'cajero' | 'mesero';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
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
