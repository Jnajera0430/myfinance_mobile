import { useSettingsGraphQL } from '@/hooks/useSettingsGraphQL';
import { ErrorLike } from '@apollo/client';
import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext.graphql';

export type Language = 'es' | 'en';
export type Currency = 'MXN' | 'USD' | 'EUR' | 'COP' | 'ARS' | 'CLP' | 'PEN';

interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'de-DE' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', locale: 'es-PE' },
];

interface LanguageInfo {
  code: Language;
  name: string;
  flag: string;
}

export const LANGUAGES: LanguageInfo[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

interface ExchangeRates {
  [key: string]: number;
}

interface SettingsContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  exchangeRates: ExchangeRates;
  isLoadingRates: boolean;
  formatCurrency: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: Currency, toCurrency: Currency) => number;
  getCurrencyInfo: (code: Currency) => CurrencyInfo | undefined;
  t: (key: string) => string;
  isLoadingSettings: boolean;
  settingsError: ErrorLike;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'app_settings';

// Translations
const translations: Record<Language, Record<string, string>> = {
  es: {
    'settings.title': 'Ajustes',
    'settings.language': 'Idioma',
    'settings.currency': 'Moneda',
    'settings.languageDescription': 'Selecciona el idioma de la aplicación',
    'settings.currencyDescription': 'Selecciona la moneda para mostrar tus finanzas',
    'settings.exchangeRates': 'Tasas de cambio',
    'settings.exchangeRatesDescription': 'Tasas actualizadas automáticamente',
    'settings.lastUpdate': 'Última actualización',
    'settings.preferences': 'Preferencias',
    'settings.regional': 'Regional',
    'common.loading': 'Cargando...',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'dashboard.greeting.morning': '¡Buenos días! ☀️',
    'dashboard.greeting.afternoon': '¡Buenas tardes! 🌤️',
    'dashboard.greeting.evening': '¡Buenas noches! 🌙',
    'dashboard.question': '¿Cómo van tus finanzas hoy?',
  },
  en: {
    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.currency': 'Currency',
    'settings.languageDescription': 'Select the application language',
    'settings.currencyDescription': 'Select the currency to display your finances',
    'settings.exchangeRates': 'Exchange Rates',
    'settings.exchangeRatesDescription': 'Rates updated automatically',
    'settings.lastUpdate': 'Last update',
    'settings.preferences': 'Preferences',
    'settings.regional': 'Regional',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'dashboard.greeting.morning': 'Good morning! ☀️',
    'dashboard.greeting.afternoon': 'Good afternoon! 🌤️',
    'dashboard.greeting.evening': 'Good evening! 🌙',
    'dashboard.question': 'How are your finances today?',
  },
};

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth();
  const {
    settings: graphqlSettings,
    isLoading: isLoadingGraphQL,
    error: graphqlError,
    updateLanguage: updateLanguageGraphQL,
    updateCurrency: updateCurrencyGraphQL,
  } = useSettingsGraphQL();
  const [language, setLanguageState] = useState<Language>('es');

  const [currency, setCurrencyState] = useState<Currency>('COP');

  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  useEffect(() => {
    if (graphqlSettings) {
      if (graphqlSettings.language) {
        setLanguageState(graphqlSettings.language as Language);
      }
      if (graphqlSettings.currency) {
        setCurrencyState(graphqlSettings.currency as Currency);
      }
    }
  }, [graphqlSettings]);

  // Fetch exchange rates from frankfurter.app (free API)
  const fetchExchangeRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (response.ok) {
        const data = await response.json();
        setExchangeRates({ USD: 1, ...data.rates });
      }
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      // Fallback rates
      setExchangeRates({
        USD: 1,
        EUR: 0.92,
        MXN: 17.15,
        COP: 3950,
        ARS: 870,
        CLP: 880,
        PEN: 3.72,
      });
    } finally {
      setIsLoadingRates(false);
    }
  }, []);

  useEffect(() => {
    fetchExchangeRates();
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchExchangeRates]);

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ language, currency }));
  }, [language, currency]);

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      setLanguageState(lang);
      if (!isDemo) {
        await updateLanguageGraphQL(lang);
      }
    } catch (error) {
      console.error('Failed to update language:', error);
      // Podrías revertir el estado local si falla
      throw error;
    }
  }, [updateLanguageGraphQL]);

  const setCurrency = useCallback(async (curr: Currency) => {
    try {
      setCurrencyState(curr);
      if (!isDemo) {
        await updateCurrencyGraphQL(curr);
      }
    } catch (error) {
      console.error('Failed to update currency:', error);
      throw error;
    }
  }, [updateCurrencyGraphQL]);

  const getCurrencyInfo = useCallback((code: Currency): CurrencyInfo | undefined => {
    return CURRENCIES.find(c => c.code === code);
  }, []);

  const formatCurrency = useCallback((amount: number): string => {
    const currencyInfo = getCurrencyInfo(currency);
    if (!currencyInfo) {
      return `$${amount.toFixed(2)}`;
    }

    return new Intl.NumberFormat(currencyInfo.locale, {
      style: 'currency',
      currency: currencyInfo.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, [currency, getCurrencyInfo]);

  const convertAmount = useCallback((amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
    if (fromCurrency === toCurrency) return amount;

    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;

    // Convert to USD first, then to target currency
    const amountInUSD = amount / fromRate;
    return amountInUSD * toRate;
  }, [exchangeRates]);

  const t = useCallback((key: string): string => {
    return translations[language][key] || key;
  }, [language]);

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        exchangeRates,
        isLoadingRates,
        formatCurrency,
        convertAmount,
        getCurrencyInfo,
        t,
        isLoadingSettings: isLoadingGraphQL,
        settingsError: graphqlError,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
