import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Elimina __typename que Apollo agrega a los objetos leidos de cache
 * antes de reenviarlos como variables de mutacion.
 */
export function stripTypename<T = unknown>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripTypename(item)) as unknown as T;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (key === '__typename') continue;
      result[key] = stripTypename(item);
    }
    return result as T;
  }

  return value;
}

/** Convierte texto de un TextInput numerico a numero (acepta 1.234,56 y 1,234.56). */
export function parseAmount(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/\s/g, '');

  const hasCommaDecimal = /^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(cleaned);
  const normalized = hasCommaDecimal
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '');

  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function initialsOf(name?: string | null): string {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
