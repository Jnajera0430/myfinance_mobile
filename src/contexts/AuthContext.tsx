import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useApolloClient, useMutation } from '@apollo/client/react';
import {
  clearAuthStorage,
  getAuthToken,
  getStoredUser,
  setAuthToken,
  setStoredUser,
} from '@/lib/auth-storage';
import { setUnauthorizedHandler } from '@/lib/apollo-client';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION } from '@/graphql/operations';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@/graphql/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  /** La app ya no tiene modo demo offline: los datos viven en el backend. */
  isDemo: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/** Credenciales creadas por `npm run seed` en el backend. */
export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@mifinanzas.com', password: 'admin123' },
  client: { email: 'demo@saas.com', password: 'demo123' },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = useApolloClient();

  const [loginMutation] = useMutation<{ login: AuthResponse }, { loginInput: LoginInput }>(
    LOGIN_MUTATION,
  );
  const [registerMutation] = useMutation<
    { register: AuthResponse },
    { registerInput: RegisterInput }
  >(REGISTER_MUTATION);

  const persistSession = useCallback(async (session: AuthResponse) => {
    await setAuthToken(session.accessToken);
    await setStoredUser(session.user);
    setUser(session.user);
  }, []);

  const clearSession = useCallback(async () => {
    await clearAuthStorage();
    setUser(null);
    await client.clearStore();
  }, [client]);

  const refreshUser = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const { data } = await client.query<{ me: User }>({
        query: ME_QUERY,
        fetchPolicy: 'network-only',
      });
      if (data?.me) {
        setUser(data.me);
        await setStoredUser(data.me);
      }
    } catch {
      // Token expirado o backend inaccesible: se conserva la sesion almacenada.
    }
  }, [client]);

  // Restaura la sesion guardada y la valida contra el backend
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [token, storedUser] = await Promise.all([getAuthToken(), getStoredUser<User>()]);

      if (cancelled) return;
      if (token && storedUser) {
        setUser(storedUser);
      }
      setIsLoading(false);

      if (token) {
        await refreshUser();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  // Cuando Apollo detecta UNAUTHENTICATED, se limpia la sesion nativa
  useEffect(() => {
    setUnauthorizedHandler(async () => {
      await clearAuthStorage();
      setUser(null);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const { data } = await loginMutation({
          variables: { loginInput: { email: email.trim().toLowerCase(), password } },
        });

        if (data?.login) {
          await persistSession(data.login);
          return true;
        }
        return false;
      } catch (error) {
        if (__DEV__) console.error('Login error:', error);
        return false;
      }
    },
    [loginMutation, persistSession],
  );

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<boolean> => {
      try {
        const { data } = await registerMutation({
          variables: {
            registerInput: { email: email.trim().toLowerCase(), password, name: name.trim() },
          },
        });

        if (data?.register) {
          await persistSession(data.register);
          return true;
        }
        return false;
      } catch (error) {
        if (__DEV__) console.error('Register error:', error);
        return false;
      }
    },
    [registerMutation, persistSession],
  );

  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.role === 'ADMIN',
      isDemo: false,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export type { User };
