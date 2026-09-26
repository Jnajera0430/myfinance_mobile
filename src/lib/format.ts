import type { Currency, Language } from '@/graphql/types';

export interface CurrencyInfo {
  code: Currency;
  name: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', locale: 'es-CO' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', locale: 'es-MX' },
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', symbol: '€', locale: 'es-ES' },
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', locale: 'es-AR' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', locale: 'es-CL' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', locale: 'es-PE' },
];

export const LANGUAGES: Array<{ code: Language; name: string; flag: string }> = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export const DEFAULT_CURRENCY: Currency = 'COP';
export const DEFAULT_LANGUAGE: Language = 'es';

export function getCurrencyInfo(code?: string | null): CurrencyInfo {
  return (
    CURRENCIES.find((currency) => currency.code === code) ??
    CURRENCIES.find((currency) => currency.code === DEFAULT_CURRENCY)!
  );
}

export function getLocale(language?: string | null): string {
  const info = getCurrencyInfo(null);
  if (language === 'en') return 'en-US';
  return info.locale;
}

/** Formatea un monto con la moneda configurada. Nunca lanza. */
export function formatAmount(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  language: Language = DEFAULT_LANGUAGE,
): string {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const info = getCurrencyInfo(currency);

  try {
    return new Intl.NumberFormat(getLocale(language), {
      style: 'currency',
      currency: info.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    const sign = value < 0 ? '-' : '';
    return `${sign}${info.symbol}${Math.abs(Math.round(value)).toLocaleString('en-US')}`;
  }
}

/** Version compacta para tarjetas pequenas (ej. $1,2 M). */
export function formatCompactAmount(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  language: Language = DEFAULT_LANGUAGE,
): string {
  const value = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const info = getCurrencyInfo(currency);

  try {
    return new Intl.NumberFormat(getLocale(language), {
      style: 'currency',
      currency: info.code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    if (Math.abs(value) >= 1_000_000) return `${info.symbol}${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `${info.symbol}${(value / 1_000).toFixed(1)}K`;
    return `${info.symbol}${Math.round(value)}`;
  }
}

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function startOfMonthISO(offsetMonths = 0): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1));
}

export function endOfMonthISO(offsetMonths = 0): string {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0));
}

export function formatDate(dateStr?: string | null, language: Language = DEFAULT_LANGUAGE): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr}`);
  if (Number.isNaN(date.getTime())) return dateStr;

  try {
    return date.toLocaleDateString(getLocale(language), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function formatShortDate(dateStr?: string | null, language: Language = DEFAULT_LANGUAGE): string {
  if (!dateStr) return '';
  const date = new Date(`${dateStr.length === 10 ? `${dateStr}T00:00:00` : dateStr}`);
  if (Number.isNaN(date.getTime())) return dateStr;

  try {
    return date.toLocaleDateString(getLocale(language), { day: 'numeric', month: 'short' });
  } catch {
    return date.toISOString().slice(5, 10);
  }
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  try {
    return date.toLocaleString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return date.toISOString();
  }
}

export function percentage(value: number): string {
  if (!Number.isFinite(value)) return '0%';
  return `${Math.round(value)}%`;
}
