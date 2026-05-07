import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { AuthState, LoginCredentials, UserRole } from '../types/auth.types';

interface AuthContextValue extends AuthState {
  login:       (credentials: LoginCredentials) => Promise<void>;
  logout:      () => Promise<void>;
  role:        UserRole | null;
  displayName: string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  const [state, setState] = useState<AuthState>({
    session:         null,
    isLoading:       true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Carga inicial de sesión
    supabase.auth.getSession().then(({ data }) => {
      setState({
        session:         data.session,
        isLoading:       false,
        isAuthenticated: !!data.session,
      });
    });

    // Escucha cambios: login, logout, refresh de token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setState({
        session,
        isLoading:       false,
        isAuthenticated: !!session,
      });

      if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const login = async ({ email, password }: LoginCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    // onAuthStateChange SIGNED_OUT se encarga de navegar a /login
  };

  const role = (state.session?.user?.app_metadata?.rol as UserRole) ?? null;
  const displayName: string =
    state.session?.user?.app_metadata?.nombre ??
    state.session?.user?.user_metadata?.nombre ??
    '';

  return (
    <AuthContext.Provider value={{ ...state, login, logout, role, displayName }}>
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
