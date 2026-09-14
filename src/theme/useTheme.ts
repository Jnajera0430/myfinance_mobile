import { useColorScheme } from 'react-native';
import { colors } from './colors';

export function useTheme() {
  const scheme = useColorScheme(); // 'light' | 'dark'
  return {
    isDark: scheme === 'dark',
    colors: scheme === 'dark' ? colors.dark : colors.light,
  };
}