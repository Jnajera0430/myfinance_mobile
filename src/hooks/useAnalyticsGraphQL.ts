import { useQuery } from '@apollo/client/react';
import {
  MONTHLY_TREND_QUERY,
  CATEGORY_BREAKDOWN_QUERY,
  DAILY_SPENDING_CAPACITY_QUERY,
  SPENDING_BY_DAY_OF_WEEK_QUERY,
  SAVINGS_RATE_QUERY,
  SMALL_EXPENSES_QUERY,
  MONTH_COMPARISON_QUERY,
} from '../graphql/operations';
import type {
  MonthlyTrend,
  CategoryBreakdown,
  DailySpending,
  SpendingByDayOfWeek,
  SavingsRate,
  SmallExpenses,
  MonthComparison,
} from '../graphql/types';
export function useMonthlyTrend(months: number = 6) {
  const { data, loading, error, refetch } = useQuery<{ monthlyTrend: MonthlyTrend[] }>(
    MONTHLY_TREND_QUERY,
    {
      variables: { months },
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    monthlyTrend: data?.monthlyTrend || [],
    isLoading: loading,
    error,
    refetch,
  };
}
export function useCategoryBreakdown(startDate: string, endDate: string) {
  const { data, loading, error, refetch } = useQuery<{ categoryBreakdown: CategoryBreakdown[] }>(
    CATEGORY_BREAKDOWN_QUERY,
    {
      variables: { startDate, endDate },
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    categoryBreakdown: data?.categoryBreakdown || [],
    isLoading: loading,
    error,
    refetch,
  };
}
export function useDailySpendingCapacity() {
  const { data, loading, error, refetch } = useQuery<{ dailySpendingCapacity: DailySpending }>(
    DAILY_SPENDING_CAPACITY_QUERY,
    {
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    dailySpending: data?.dailySpendingCapacity,
    isLoading: loading,
    error,
    refetch,
  };
}
export function useSpendingByDayOfWeek(startDate: string, endDate: string) {
  const { data, loading, error, refetch } = useQuery<{ spendingByDayOfWeek: SpendingByDayOfWeek[] }>(
    SPENDING_BY_DAY_OF_WEEK_QUERY,
    {
      variables: { startDate, endDate },
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    spendingByDay: data?.spendingByDayOfWeek || [],
    isLoading: loading,
    error,
    refetch,
  };
}
export function useSavingsRate(months: number = 1) {
  const { data, loading, error, refetch } = useQuery<{ savingsRate: SavingsRate }>(
    SAVINGS_RATE_QUERY,
    {
      variables: { months },
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    savingsRate: data?.savingsRate,
    isLoading: loading,
    error,
    refetch,
  };
}
export function useSmallExpenses(startDate: string, endDate: string, threshold: number = 100) {
  const { data, loading, error, refetch } = useQuery<{ smallExpenses: SmallExpenses }>(
    SMALL_EXPENSES_QUERY,
    {
      variables: { startDate, endDate, threshold },
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    smallExpenses: data?.smallExpenses,
    isLoading: loading,
    error,
    refetch,
  };
}
export function useMonthComparison() {
  const { data, loading, error, refetch } = useQuery<{ monthComparison: MonthComparison }>(
    MONTH_COMPARISON_QUERY,
    {
      fetchPolicy: 'cache-and-network',
    }
  );
  return {
    monthComparison: data?.monthComparison,
    isLoading: loading,
    error,
    refetch,
  };
}
// Hook combinado para obtener todos los analytics
export function useAnalyticsGraphQL(startDate: string, endDate: string) {
  const { monthlyTrend, isLoading: trendLoading } = useMonthlyTrend(6);
  const { categoryBreakdown, isLoading: breakdownLoading } = useCategoryBreakdown(startDate, endDate);
  const { dailySpending, isLoading: dailyLoading } = useDailySpendingCapacity();
  const { savingsRate, isLoading: savingsLoading } = useSavingsRate();
  const { monthComparison, isLoading: comparisonLoading } = useMonthComparison();
  return {
    monthlyTrend,
    categoryBreakdown,
    dailySpending,
    savingsRate,
    monthComparison,
    isLoading: trendLoading || breakdownLoading || dailyLoading || savingsLoading || comparisonLoading,
  };
}
