import { useCallback, useState } from 'react';
import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';
import { clearAuthStorage, getAuthToken, setAuthToken, setStoredUser } from '@/lib/auth-storage';
import { LOGIN_MUTATION, ME_QUERY, REGISTER_MUTATION } from '@/graphql/operations';
import type { AuthResponse, LoginInput, RegisterInput, User } from '@/graphql/types';

interface UseAuthGraphQLReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

/**
 * Version "hook" de autenticacion (sin contexto).
 * AuthContext es la via recomendada; esto sirve para pantallas puntuales.
 */
export function useAuthGraphQL(): UseAuthGraphQLReturn {
  const client = useApolloClient();
  const [user, setUser] = useState<User | null>(null);
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  const { loading: userLoading, refetch } = useQuery<{ me: User }>(ME_QUERY, {
    skip: !hasToken,
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        void setStoredUser(data.me);
      }
    },
    onError: () => {
      void clearAuthStorage();
      setUser(null);
    },
  });

  // Estado inicial asincrono: SecureStore no puede leerse durante el render.
  useEffect(() => {
    let mounted = true;
    void getAuthToken().then((token) => {
      if (mounted) setHasToken(!!token);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const [loginMutation, { loading: loginLoading }] = useMutation<
    { login: AuthResponse },
    { loginInput: LoginInput }
  >(LOGIN_MUTATION);

  const [registerMutation, { loading: registerLoading }] = useMutation<
    { register: AuthResponse },
    { registerInput: RegisterInput }
  >(REGISTER_MUTATION);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await loginMutation({
          variables: { loginInput: { email: email.trim().toLowerCase(), password } },
        });
        if (data?.login) {
          await setAuthToken(data.login.accessToken);
          await setStoredUser(data.login.user);
          setUser(data.login.user);
          setHasToken(true);
          return true;
        }
        return false;
      } catch (error) {
        if (__DEV__) console.error('Login error:', error);
        return false;
      }
    },
    [loginMutation],
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      try {
        const { data } = await registerMutation({
          variables: {
            registerInput: { email: email.trim().toLowerCase(), password, name: name.trim() },
          },
        });
        if (data?.register) {
          await setAuthToken(data.register.accessToken);
          await setStoredUser(data.register.user);
          setUser(data.register.user);
          setHasToken(true);
          return true;
        }
        return false;
      } catch (error) {
        if (__DEV__) console.error('Register error:', error);
        return false;
      }
    },
    [registerMutation],
  );

  const logout = useCallback(async () => {
    await clearAuthStorage();
    setUser(null);
    setHasToken(false);
    await client.clearStore();
  }, [client]);

  const refetchUser = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    user,
    isLoading: userLoading || loginLoading || registerLoading || hasToken === null,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refetchUser,
  };
}
