import type { ExpenseCategory, IncomeCategory, TransactionType } from '@/graphql/types';

export interface CategoryDefinition {
  value: string;
  label: string;
  icon: string;
  color: string;
  type: TransactionType;
}

/**
 * Catalogo fijo del dominio.
 * Espejo de finance_backend/src/common/enums/category.enum.ts:
 * el backend no expone una consulta de categorias, se resuelven en el cliente.
 */
export const INCOME_CATEGORIES: CategoryDefinition[] = [
  { value: 'salary', label: 'Sueldo principal', icon: 'wallet', color: '#22c55e', type: 'INCOME' },
  { value: 'bonus', label: 'Bonificaciones', icon: 'gift', color: '#10b981', type: 'INCOME' },
  { value: 'extras', label: 'Ingresos extra', icon: 'rocket', color: '#14b8a6', type: 'INCOME' },
  { value: 'other_income', label: 'Otros ingresos', icon: 'banknote', color: '#0ea5e9', type: 'INCOME' },
];

export const FIXED_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { value: 'rent', label: 'Arriendo', icon: 'home', color: '#ef4444', type: 'FIXED_EXPENSE' },
  { value: 'utilities', label: 'Servicios', icon: 'zap', color: '#f97316', type: 'FIXED_EXPENSE' },
  { value: 'subscriptions', label: 'Suscripciones', icon: 'repeat', color: '#8b5cf6', type: 'FIXED_EXPENSE' },
  { value: 'insurance', label: 'Seguros', icon: 'shield', color: '#6366f1', type: 'FIXED_EXPENSE' },
];

export const VARIABLE_EXPENSE_CATEGORIES: CategoryDefinition[] = [
  { value: 'food', label: 'Comida', icon: 'utensils', color: '#f59e0b', type: 'VARIABLE_EXPENSE' },
  { value: 'transport', label: 'Transporte', icon: 'car', color: '#0ea5e9', type: 'VARIABLE_EXPENSE' },
  { value: 'entertainment', label: 'Entretenimiento', icon: 'film', color: '#ec4899', type: 'VARIABLE_EXPENSE' },
  { value: 'shopping', label: 'Compras', icon: 'shopping-bag', color: '#a855f7', type: 'VARIABLE_EXPENSE' },
  { value: 'other_expense', label: 'Otros gastos', icon: 'package', color: '#64748b', type: 'VARIABLE_EXPENSE' },
];

export const ALL_CATEGORIES: CategoryDefinition[] = [
  ...INCOME_CATEGORIES,
  ...FIXED_EXPENSE_CATEGORIES,
  ...VARIABLE_EXPENSE_CATEGORIES,
];

export const CATEGORIES_BY_TYPE: Record<TransactionType, CategoryDefinition[]> = {
  INCOME: INCOME_CATEGORIES,
  FIXED_EXPENSE: FIXED_EXPENSE_CATEGORIES,
  VARIABLE_EXPENSE: VARIABLE_EXPENSE_CATEGORIES,
};

export function getCategoryDefinition(category?: string | null): CategoryDefinition | undefined {
  if (!category) return undefined;
  return ALL_CATEGORIES.find((item) => item.value === category);
}

export function getCategoryLabel(category?: string | null): string {
  return getCategoryDefinition(category)?.label ?? category ?? 'Sin categoría';
}

export function getCategoryColor(category?: string | null): string {
  return getCategoryDefinition(category)?.color ?? '#94a3b8';
}

export function getCategoryIconName(category?: string | null): string {
  return getCategoryDefinition(category)?.icon ?? 'circle';
}

const CATEGORY_EMOJI: Record<string, string> = {
  salary: '💰',
  bonus: '🎁',
  extras: '🚀',
  other_income: '💵',
  rent: '🏠',
  utilities: '💡',
  subscriptions: '📱',
  insurance: '🛡️',
  food: '🍔',
  transport: '🚗',
  entertainment: '🎬',
  shopping: '🛒',
  other_expense: '📦',
};

export function getCategoryEmoji(category?: string | null): string {
  if (!category) return '📄';
  return CATEGORY_EMOJI[category] ?? '📄';
}

/** Alias usado por componentes heredados de la version web. */
export const getCategoryIcon = getCategoryEmoji;

export function getCategoriesByType(type: TransactionType): CategoryDefinition[] {
  return CATEGORIES_BY_TYPE[type] ?? [];
}

export const INCOME_CATEGORY_VALUES = INCOME_CATEGORIES.map((c) => c.value) as IncomeCategory[];
export const EXPENSE_CATEGORY_VALUES = [
  ...FIXED_EXPENSE_CATEGORIES,
  ...VARIABLE_EXPENSE_CATEGORIES,
].map((c) => c.value) as ExpenseCategory[];
