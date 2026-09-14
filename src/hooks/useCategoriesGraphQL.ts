import { useQuery } from '@apollo/client/react';
import { CATEGORIES_QUERY, CATEGORIES_BY_TYPE_QUERY } from '../graphql/operations';
import type { Category } from '../graphql/types';
export function useCategoriesGraphQL(type?: string) {
  const { data: allData, loading: allLoading, error: allError, refetch: refetchAll } = useQuery<{ categories: Category[] }>(
    CATEGORIES_QUERY,
    {
      fetchPolicy: 'cache-first',
      skip: !!type,
    }
  );
  const { data: typeData, loading: typeLoading, error: typeError, refetch: refetchByType } = useQuery<{ categoriesByType: Category[] }>(
    CATEGORIES_BY_TYPE_QUERY,
    {
      variables: { type },
      fetchPolicy: 'cache-first',
      skip: !type,
    }
  );
  return {
    categories: type ? typeData?.categoriesByType : allData?.categories,
    isLoading: type ? typeLoading : allLoading,
    error: type ? typeError : allError,
    refetch: type ? refetchByType : refetchAll,
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
