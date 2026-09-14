import { useMutation, useQuery, useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { 
  LOGIN_MUTATION, 
  REGISTER_MUTATION, 
  ME_QUERY 
} from '../graphql/operations';
import type { User, AuthResponse, LoginInput } from '../graphql/types';

interface UseAuthReturn {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  refetchUser: () => void;
}

export function useAuthGraphQL(): UseAuthReturn {
  const client = useApolloClient();
  
  // Query current user
  const { data: userData, loading: userLoading, refetch: refetchUser, error: userError } = useQuery<{ me: User }>(
    ME_QUERY,
    {
      skip: !localStorage.getItem('auth_token'),
      errorPolicy: 'all',
    }
  );

  // Handle auth errors
  if (userError) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Login mutation
  const [loginMutation, { loading: loginLoading }] = useMutation<
    { login: AuthResponse },
    { loginInput: LoginInput }
  >(LOGIN_MUTATION);

  // Register mutation
  const [registerMutation, { loading: registerLoading }] = useMutation<
    { register: AuthResponse },
    { email: string; password: string; name: string }
  >(REGISTER_MUTATION);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await loginMutation({
        variables: { loginInput: { email, password } },
      });
      
      if (data?.login) {
        localStorage.setItem('auth_token', data.login.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.login.user));
        
        // Refetch user data
        await refetchUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [loginMutation, refetchUser]);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      const { data } = await registerMutation({
        variables: { email, password, name },
      });
      
      if (data?.register) {
        localStorage.setItem('auth_token', data.register.accessToken);
        localStorage.setItem('auth_user', JSON.stringify(data.register.user));
        
        // Refetch user data
        await refetchUser();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  }, [registerMutation, refetchUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    client.clearStore();
    window.location.href = '/login';
  }, [client]);

  // Cast to ensure proper typing - Apollo returns DeepPartial but our query fetches all fields
  const user = userData?.me ? (userData.me as unknown as User) : null;
  const isLoading = userLoading || loginLoading || registerLoading;
  const isAuthenticated = !!user && !!localStorage.getItem('auth_token');

  return {
    user,
    isLoading,
    isAuthenticated,
    isAdmin: user?.role.toLocaleLowerCase() === 'admin',
    login,
    register,
    logout,
    refetchUser,
  };
}
