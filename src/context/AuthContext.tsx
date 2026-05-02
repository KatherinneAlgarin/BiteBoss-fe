import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { AuthState, AuthUser, LoginCredentials } from '../types/auth';
import { signIn, signOut, getUserProfile } from '../services/authService';
import { supabase } from '../services/supabaseClient';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

const GENERIC_ERROR = 'Ocurrió un error. Intenta de nuevo.';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  const loadUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      const profile = await getUserProfile(userId);
      const authUser: AuthUser = { id: userId, email, profile };
      setState({ user: authUser, isLoading: false, isAuthenticated: true });
    } catch {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email ?? '');
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUserProfile(session.user.id, session.user.email ?? '');
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserProfile]);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { user } = await signIn(credentials);
      if (!user) throw new Error(GENERIC_ERROR);
      await loadUserProfile(user.id, user.email ?? '');
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error(GENERIC_ERROR);
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      await signOut();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
      throw new Error(GENERIC_ERROR);
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
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
