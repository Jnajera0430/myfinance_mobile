// src/contexts/AuthContext.tsx (React Native)
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { LOGIN_MUTATION, REGISTER_MUTATION, } from '../graphql/operations';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { AuthResponse, LoginInput } from '../graphql';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'client';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

// Credenciales demo
// const DEMO_ADMIN: User = {
//   id: '1',
//   email: 'admin@mifinanzas.com',
//   name: 'Admin',
//   role: 'admin',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   avatar: ''
// };

// const DEMO_CLIENT: User = {
//   id: '2',
//   email: 'demo@saas.com',
//   name: 'Demo User',
//   role: 'client',
//   createdAt: new Date().toISOString(),
//   updatedAt: new Date().toISOString(),
//   avatar: ''
// };

export const DEMO_CREDENTIALS = {
  admin: { email: 'admin@mifinanzas.com', password: 'admin123' },
  client: { email: 'demo@saas.com', password: 'demo123' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const client = useApolloClient();

  // Cargar usuario almacenado al iniciar
  useEffect(() => {
    (async () => {
      const stored = await SecureStore.getItemAsync('auth_user');
      if (stored) setUser(JSON.parse(stored));
      setIsLoading(false);
    })();
  }, []);

  const [loginMutation] = useMutation<{ login: AuthResponse }, { loginInput: LoginInput }>(LOGIN_MUTATION);
  const [registerMutation] = useMutation<{ register: AuthResponse }, { email: string; password: string; name: string }>(REGISTER_MUTATION);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { loginInput: { email, password } },
      });
      if (data?.login) {
        await SecureStore.setItemAsync('auth_token', data.login.accessToken);
        await SecureStore.setItemAsync('auth_user', JSON.stringify(data.login.user));
        setUser(data.login.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    await SecureStore.deleteItemAsync('auth_user');
    setUser(null);
    await client.clearStore();
  }, [client]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.role === 'admin',
      login,
      register: async () => false,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};