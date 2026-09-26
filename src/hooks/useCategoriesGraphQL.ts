import { useMemo } from 'react';
import {
  FIXED_EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  VARIABLE_EXPENSE_CATEGORIES,
  type CategoryDefinition,
} from '@/lib/categories';
import type { TransactionType } from '@/graphql/types';

/**
 * El backend no expone categorias: son un catalogo fijo del dominio
 * (finance_backend/src/common/enums/category.enum.ts).
 * El hook mantiene la API que usaban las pantallas, pero resuelto en el cliente.
 */
export function useCategoriesGraphQL(type?: string) {
  const categories = useMemo<CategoryDefinition[]>(() => {
    switch (type) {
      case 'income':
        return INCOME_CATEGORIES;
      case 'fixed_expense':
      case 'FIXED_EXPENSE':
        return FIXED_EXPENSE_CATEGORIES;
      case 'variable_expense':
      case 'VARIABLE_EXPENSE':
        return VARIABLE_EXPENSE_CATEGORIES;
      case 'expense':
        return [...FIXED_EXPENSE_CATEGORIES, ...VARIABLE_EXPENSE_CATEGORIES];
      default:
        return [...INCOME_CATEGORIES, ...FIXED_EXPENSE_CATEGORIES, ...VARIABLE_EXPENSE_CATEGORIES];
    }
  }, [type]);

  return {
    categories,
    isLoading: false,
    error: null,
    refetch: () => Promise.resolve(),
  };
}

export function useIncomeCategories() {
  return useCategoriesGraphQL('income');
}

export function useExpenseCategories() {
  return useCategoriesGraphQL('expense');
}

export function useFixedExpenseCategories() {
  return useCategoriesGraphQL('fixed_expense');
}

export function useVariableExpenseCategories() {
  return useCategoriesGraphQL('variable_expense');
}

export function useCategoriesForType(type: TransactionType) {
  return useCategoriesGraphQL(type);
}
