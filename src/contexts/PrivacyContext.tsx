import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { readFlag, writeFlag } from '@/lib/auth-storage';
import { formatAmount } from '@/lib/format';
import { useSettings } from './SettingsContext';

const STORAGE_KEY = 'privacy_incognito';

interface PrivacyContextType {
  isIncognito: boolean;
  toggleIncognito: () => void;
  /** Enmascara el monto cuando el modo privado esta activo. */
  formatAmount: (amount: number, forceShow?: boolean) => string;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isIncognito, setIsIncognito] = useState(false);
  const { currency, language } = useSettings();

  // React Native no tiene document.body: el estado se persiste nativamente.
  useEffect(() => {
    let mounted = true;
    readFlag(STORAGE_KEY).then((value) => {
      if (mounted) setIsIncognito(value);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const toggleIncognito = useCallback(() => {
    setIsIncognito((prev) => {
      const next = !prev;
      void writeFlag(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const formatValue = useCallback(
    (amount: number, forceShow = false) => {
      if (isIncognito && !forceShow) return '••••••';
      return formatAmount(amount, currency, language);
    },
    [isIncognito, currency, language],
  );

  const value = useMemo(
    () => ({ isIncognito, toggleIncognito, formatAmount: formatValue }),
    [isIncognito, toggleIncognito, formatValue],
  );

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (!context) throw new Error('usePrivacy must be used within PrivacyProvider');
  return context;
}
