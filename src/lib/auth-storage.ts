import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const isWeb = Platform.OS === 'web';

async function read(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* almacenamiento no disponible */
    }
    return;
  }
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    /* almacenamiento no disponible */
  }
}

async function remove(key: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      /* almacenamiento no disponible */
    }
    return;
  }
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    /* almacenamiento no disponible */
  }
}

export const getAuthToken = () => read(TOKEN_KEY);
export const setAuthToken = (token: string) => write(TOKEN_KEY, token);

export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const setStoredUser = (user: unknown) => write(USER_KEY, JSON.stringify(user));

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([remove(TOKEN_KEY), remove(USER_KEY)]);
}

export async function readFlag(key: string): Promise<boolean> {
  return (await read(key)) === 'true';
}

export function writeFlag(key: string, value: boolean): Promise<void> {
  return write(key, value ? 'true' : 'false');
}

export function removeFlag(key: string): Promise<void> {
  return remove(key);
}
