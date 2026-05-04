import type { LoginCredentials, UserProfile } from '../types/auth.types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface BackendUsuario {
  id_usuario: number;
  nombre: string;
  email: string;
  id_usuario_sucursal: number;
  id_rol: number;
  rol: string;
  id_sucursal: number;
  sucursal: string;
}

export interface LoginResponse {
  token: string;
  usuario: UserProfile;
}

export async function signIn(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password,
    }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.mensaje ?? 'Credenciales incorrectas');
  }

  const data: { token: string; usuario: BackendUsuario } = await res.json();

  const usuario: UserProfile = {
    id_usuario: data.usuario.id_usuario,
    nombre: data.usuario.nombre,
    email: data.usuario.email,
    activo: true,
    role: data.usuario.rol as UserProfile['role'],
    id_rol: data.usuario.id_rol,
    id_sucursal: data.usuario.id_sucursal,
    id_usuario_sucursal: data.usuario.id_usuario_sucursal,
  };

  return { token: data.token, usuario };
}

export function signOut() {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
}

export function getStoredSession(): { token: string; user: UserProfile } | null {
  const token = localStorage.getItem('auth_token');
  const userStr = localStorage.getItem('auth_user');
  if (!token || !userStr) return null;
  try {
    return { token, user: JSON.parse(userStr) };
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: UserProfile) {
  localStorage.setItem('auth_token', token);
  localStorage.setItem('auth_user', JSON.stringify(user));
}
