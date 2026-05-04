import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState, AuthUser, LoginCredentials } from '../types/auth.types';
import { signIn, signOut, getStoredSession, storeSession } from '../services/auth.service';

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

  useEffect(() => {
    const session = getStoredSession();
    if (session) {
      const authUser: AuthUser = {
        id: String(session.user.id_usuario),
        email: session.user.email,
        profile: session.user,
      };
      setState({ user: authUser, isLoading: false, isAuthenticated: true });
    } else {
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const { token, usuario } = await signIn(credentials);
      storeSession(token, usuario);
      const authUser: AuthUser = {
        id: String(usuario.id_usuario),
        email: usuario.email,
        profile: usuario,
      };
      setState({ user: authUser, isLoading: false, isAuthenticated: true });
    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw err instanceof Error ? err : new Error(GENERIC_ERROR);
    }
  };

  const logout = async () => {
    signOut();
    setState({ user: null, isLoading: false, isAuthenticated: false });
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
