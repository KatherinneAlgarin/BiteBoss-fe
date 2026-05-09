import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthState, LoginCredentials, UserRole } from '../types/auth.types';

interface DbUserInfo {
  rol:         UserRole;
  nombre:      string;
  id_sucursal: number;
}

interface AuthContextValue extends AuthState {
  login:       (credentials: LoginCredentials) => Promise<void>;
  logout:      () => Promise<void>;
  role:        UserRole | null;
  displayName: string;
  id_sucursal: number | null;
}

const DB_INFO_KEY = (authId: string) => `bb_user_${authId}`;

async function fetchUserInfo(token: string): Promise<DbUserInfo> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({})) as { mensaje?: string };
    throw new Error(data.mensaje ?? 'No se pudo obtener la información del usuario');
  }

  const data = await res.json() as { usuario: { rol: UserRole; nombre: string; id_sucursal: number } };
  return { rol: data.usuario.rol, nombre: data.usuario.nombre, id_sucursal: data.usuario.id_sucursal };
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session:         null,
    isLoading:       true,
    isAuthenticated: false,
  });

  const [dbUserInfo, setDbUserInfo] = useState<DbUserInfo | null>(null);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;

      if (session?.user.id) {
        const stored = localStorage.getItem(DB_INFO_KEY(session.user.id));
        let info: DbUserInfo | null = null;

        if (stored) {
          try { info = JSON.parse(stored) as DbUserInfo; } catch { /* localStorage corrupto */ }
        }

        if (!info) {
          // Sin info cacheada: pedirla al backend usando el JWT
          try {
            info = await fetchUserInfo(session.access_token);
            localStorage.setItem(DB_INFO_KEY(session.user.id), JSON.stringify(info));
          } catch {
            // Sesión válida pero sin registro en DB → cerrar sesión
            await supabase.auth.signOut();
            if (!mounted) return;
            setState({ session: null, isLoading: false, isAuthenticated: false });
            return;
          }
        }

        if (!mounted) return;
        setDbUserInfo(info);
      }

      if (!mounted) return;
      setState({
        session,
        isLoading:       false,
        isAuthenticated: !!session,
      });
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // INITIAL_SESSION lo gestiona la inicialización de arriba
      // SIGNED_IN lo gestiona login() de forma atómica (junto con dbUserInfo)
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') return;
      if (!mounted) return;

      setState({
        session,
        isLoading:       false,
        isAuthenticated: !!session,
      });

      if (event === 'SIGNED_OUT') {
        setDbUserInfo(null);
        // ProtectedRoute redirige automáticamente al detectar !isAuthenticated
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }: LoginCredentials) => {
    // 1. Autentica con Supabase y obtiene el JWT
    const { data: supabaseData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);

    const session = supabaseData.session;
    if (!session) {
      await supabase.auth.signOut();
      throw new Error('No se pudo establecer la sesión');
    }

    // 2. Obtiene rol y datos del usuario usando el JWT (la contraseña no sale del cliente Supabase)
    let info: DbUserInfo;
    try {
      info = await fetchUserInfo(session.access_token);
    } catch (err) {
      await supabase.auth.signOut();
      throw err instanceof Error ? err : new Error('Error al obtener la información del usuario');
    }

    // Actualización atómica: dbUserInfo + sesión a la vez para evitar render
    // intermedio con isAuthenticated=true y rol=null (causaría parpadeo).
    localStorage.setItem(DB_INFO_KEY(session.user.id), JSON.stringify(info));
    setDbUserInfo(info);
    setState({
      session,
      isLoading:       false,
      isAuthenticated: true,
    });
  };

  const logout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user.id) {
      localStorage.removeItem(DB_INFO_KEY(session.user.id));
    }
    await supabase.auth.signOut();
    // SIGNED_OUT limpia dbUserInfo y navega a /login
  };

  const role: UserRole | null = dbUserInfo?.rol ?? null;
  const displayName: string = dbUserInfo?.nombre ?? '';
  const id_sucursal: number | null = dbUserInfo?.id_sucursal ?? null;

  // Mantener isLoading=true mientras hay sesión pero el rol no se haya resuelto.
  // Evita que ProtectedRoute deje pasar a RoleRoute con role=null por una condición
  // de carrera entre la inicialización y eventos de Supabase (TOKEN_REFRESHED).
  const isLoading = state.isLoading || (state.isAuthenticated && !dbUserInfo);

  return (
    <AuthContext.Provider value={{ ...state, isLoading, login, logout, role, displayName, id_sucursal }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext debe usarse dentro de <AuthProvider>');
  }
  return context;
}
