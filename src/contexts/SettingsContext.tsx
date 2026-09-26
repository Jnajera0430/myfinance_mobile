import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { ErrorLike } from '@apollo/client';
import { useSettingsGraphQL } from '@/hooks/useSettingsGraphQL';
import {
  DEFAULT_CURRENCY,
  DEFAULT_LANGUAGE,
  formatAmount as formatWithCurrency,
  getCurrencyInfo,
  type CurrencyInfo,
} from '@/lib/format';
import { CURRENCIES, LANGUAGES } from '@/lib/format';
import type { Currency, Language } from '@/graphql/types';
import { useQuery } from '@apollo/client/react';
import { EXCHANGE_RATES_QUERY } from '@/graphql/operations';
import type { ExchangeRate } from '@/graphql/types';

export type { Currency, Language, CurrencyInfo };
export { CURRENCIES, LANGUAGES };

interface ExchangeRates {
  [code: string]: number;
}

/** Respaldo estatico cuando el backend aun no tiene tasas sincronizadas. */
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  EUR: 0.92,
  MXN: 17.15,
  COP: 3950,
  ARS: 870,
  CLP: 880,
  PEN: 3.72,
};

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  darkMode: boolean;
  setDarkMode: (value: boolean) => Promise<void>;
  payday: number;
  exchangeRates: ExchangeRates;
  isLoadingRates: boolean;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getCurrencyInfo: (code?: string | null) => CurrencyInfo;
  t: (key: string) => string;
  isLoadingSettings: boolean;
  settingsError: ErrorLike | null;
}

const translations: Record<Language, Record<string, string>> = {
  es: {
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.currency': 'Moneda',
    'settings.payday': 'Día de pago',
    'settings.appearance': 'Apariencia',
    'settings.darkMode': 'Modo oscuro',
    'settings.privacy': 'Privacidad',
    'settings.hideAmounts': 'Ocultar montos',
    'settings.account': 'Cuenta',
    'settings.logout': 'Cerrar sesión',
    'settings.exchangeRates': 'Tasas de cambio',
    'settings.lastUpdate': 'Última actualización',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.retry': 'Reintentar',
    'dashboard.greeting.morning': '¡Buenos días!',
    'dashboard.greeting.afternoon': '¡Buenas tardes!',
    'dashboard.greeting.evening': '¡Buenas noches!',
    'dashboard.question': '¿Cómo van tus finanzas hoy?',
  },
  en: {
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.payday': 'Payday',
    'settings.appearance': 'Appearance',
    'settings.darkMode': 'Dark mode',
    'settings.privacy': 'Privacy',
    'settings.hideAmounts': 'Hide amounts',
    'settings.account': 'Account',
    'settings.logout': 'Sign out',
    'settings.exchangeRates': 'Exchange rates',
    'settings.lastUpdate': 'Last update',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.retry': 'Retry',
    'dashboard.greeting.morning': 'Good morning!',
    'dashboard.greeting.afternoon': 'Good afternoon!',
    'dashboard.greeting.evening': 'Good evening!',
    'dashboard.question': 'How are your finances today?',
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const {
    settings,
    isLoading: isLoadingGraphQL,
    error: graphqlError,
    updateLanguage,
    updateCurrency,
    updateDarkMode,
  } = useSettingsGraphQL();

  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [currency, setCurrencyState] = useState<Currency>(DEFAULT_CURRENCY);
  const [darkMode, setDarkModeState] = useState(false);

  const { data: ratesData, loading: isLoadingRates } = useQuery<{ exchangeRates: ExchangeRate[] }>(
    EXCHANGE_RATES_QUERY,
    { fetchPolicy: 'cache-and-network', errorPolicy: 'all' },
  );

  useEffect(() => {
    if (!settings) return;
    if (settings.language) setLanguageState(settings.language as Language);
    if (settings.currency) setCurrencyState(settings.currency as Currency);
    setDarkModeState(!!settings.darkMode);
  }, [settings]);

  const exchangeRates = useMemo<ExchangeRates>(() => {
    const rates: ExchangeRates = { ...FALLBACK_RATES };

    for (const row of ratesData?.exchangeRates ?? []) {
      if (row.baseCurrency === 'USD') {
        rates[row.targetCurrency] = Number(row.rate);
      }
    }

    return rates;
  }, [ratesData]);

  const setLanguage = useCallback(
    async (lang: Language) => {
      setLanguageState(lang);
      await updateLanguage(lang);
    },
    [updateLanguage],
  );

  const setCurrency = useCallback(
    async (curr: Currency) => {
      setCurrencyState(curr);
      await updateCurrency(curr);
    },
    [updateCurrency],
  );

  const setDarkMode = useCallback(
    async (value: boolean) => {
      setDarkModeState(value);
      await updateDarkMode(value);
    },
    [updateDarkMode],
  );

  const formatCurrency = useCallback(
    (amount: number) => formatWithCurrency(amount, currency, language),
    [currency, language],
  );

  const convertAmount = useCallback(
    (amount: number, from: Currency, to: Currency): number => {
      if (from === to) return amount;
      const fromRate = exchangeRates[from] || 1;
      const toRate = exchangeRates[to] || 1;
      return (amount / fromRate) * toRate;
    },
    [exchangeRates],
  );

  const t = useCallback((key: string) => translations[language]?.[key] ?? key, [language]);

  const value = useMemo<SettingsContextType>(
    () => ({
      language,
      setLanguage,
      currency,
      setCurrency,
      darkMode,
      setDarkMode,
      payday: settings?.payday ?? 15,
      exchangeRates,
      isLoadingRates,
      formatCurrency,
      convertAmount,
      getCurrencyInfo,
      t,
      isLoadingSettings: isLoadingGraphQL,
      settingsError: graphqlError ?? null,
    }),
    [
      language,
      setLanguage,
      currency,
      setCurrency,
      darkMode,
      setDarkMode,
      settings?.payday,
      exchangeRates,
      isLoadingRates,
      formatCurrency,
      convertAmount,
      t,
      isLoadingGraphQL,
      graphqlError,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextType {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
