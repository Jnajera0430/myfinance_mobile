import { useMemo } from 'react';
import { TransactionCategory, getCategoryLabel, useFinance as useFinanceLocal } from '@/contexts/FinanceContext';
import { useFinance } from '@/contexts/FinanceContext.graphql';
import { useQuery } from '@apollo/client/react';
import { CATEGORY_BREAKDOWN_QUERY, DAILY_SPENDING_CAPACITY_QUERY, MONTH_COMPARISON_QUERY, MONTHLY_TREND_QUERY, SAVINGS_RATE_QUERY, SMALL_EXPENSES_QUERY, SPENDING_BY_DAY_OF_WEEK_QUERY } from '@/graphql';
import { useAuth } from '@/contexts/AuthContext.graphql';

export interface CategorySpending {
  category: TransactionCategory;
  label: string;
  amount: number;
  percentage: number;
  previousAmount?: number;
  change?: number;
}

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  income: number;
  expenses: number;
  balance: number;
  isPositive: boolean;
}

export interface DaySpending {
  dayOfWeek: number;
  dayName: string;
  totalAmount: number;
  averageAmount: number;
  transactionCount: number;
}

export interface SmallExpense {
  category: string;
  amount: number;
  count: number;
}

export interface MonthComparison {
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  difference: number;
  percentageChange: number;
  isImprovement: boolean;
  message: string;
}

export interface FinanceAnalytics {
  // 1. Top spending categories
  topCategories: CategorySpending[];
  topCategoryMessage: string;

  // 2. Monthly trends
  monthlyTrends: MonthlyTrend[];
  trendMessage: string;
  negativeMonthsStreak: number;

  // 3. Savings rate
  savingsRate: number;
  savingsRateLevel: 'critical' | 'warning' | 'good' | 'excellent';
  savingsRateMessage: string;
  savingsPerHundred: number;

  // 4. Small expenses (ant expenses)
  smallExpenses: SmallExpense[];
  smallExpensesTotal: number;
  smallExpensesMessage: string;

  // 5. Day of week spending
  daySpending: DaySpending[];
  highestSpendingDay: string;
  daySpendingMessage: string;
  weekendVsWeekdayRatio: number;

  // 6. Fixed vs Variable ratio
  fixedVsVariableRatio: {
    fixedPercentage: number;
    variablePercentage: number;
    committedMessage: string;
  };

  // 7. Month over month comparison
  monthComparison: {
    currentMonthExpenses: number;
    previousMonthExpenses: number;
    difference: number;
    percentageChange: number;
    isImprovement: boolean;
    message: string;
  };

  // 8. End of month projection
  projection: {
    projectedBalance: number;
    daysRemaining: number;
    dailyAverageSpending: number;
    projectedSpending: number;
    isPositive: boolean;
    message: string;
  };

  // 9. Category comparison vs previous month
  categoryComparison: CategorySpending[];

  // 10. Best month
  bestMonth: {
    month: string;
    monthLabel: string;
    savings: number;
    savingsRate: number;
  } | null;
  positiveMonthsStreak: number;

  // Bonus: Smart insights
  insights: string[];
}

const SMALL_EXPENSE_THRESHOLD = 10000; // Transactions under $100 are considered "ant expenses"

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];


export function useMonthlyTrend(months = 6) {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const {isDemo} = useAuth();
  const { data, loading, error } = useQuery<{ monthlyTrend: MonthlyTrend[] }>(MONTHLY_TREND_QUERY, {
    variables: { months },
  });

  return useMemo(() => ({
    data: data?.monthlyTrend || [],
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useCategoryBreakdown(startDate: string, endDate: string) {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const {isDemo} = useAuth();
  const { data, loading, error } = useQuery<{ categoryBreakdown: CategorySpending[] }>(CATEGORY_BREAKDOWN_QUERY, {
    variables: { startDate, endDate },
  });

  return useMemo(() => ({
    data: data?.categoryBreakdown || [],
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useDailySpendingCapacity() {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const {isDemo} = useAuth();
  const { data, loading, error } = useQuery<{ dailySpendingCapacity: number }>(DAILY_SPENDING_CAPACITY_QUERY);

  return useMemo(() => ({
    data: data?.dailySpendingCapacity,
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useSpendingByDayOfWeek(startDate: string, endDate: string) {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const {isDemo} = useAuth();
  const { data, loading, error } = useQuery<{ spendingByDayOfWeek: DaySpending[] }>(SPENDING_BY_DAY_OF_WEEK_QUERY, {
    variables: { startDate, endDate },
  });

  return useMemo(() => ({
    data: data?.spendingByDayOfWeek || [],
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useSavingsRate(months = 1) {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const {isDemo} = useAuth();
  const { data, loading, error } = useQuery<{ savingsRate: number }>(SAVINGS_RATE_QUERY, {
    variables: { months },
  });

  return useMemo(() => ({
    data: data?.savingsRate,
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useSmallExpenses(startDate: string, endDate: string, threshold = 10000) {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const {isDemo} = useAuth();
  const { data, loading, error } = useQuery<{ smallExpenses: SmallExpense[] }>(SMALL_EXPENSES_QUERY, {
    variables: { startDate, endDate, threshold },
  });

  return useMemo(() => ({
    data: data?.smallExpenses,
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useMonthComparison() {
  const { transactions } = useFinance();
  const { transactions: localTransactions } = useFinanceLocal();
  const { isDemo } = useAuth();
  const { data, loading, error } = useQuery<{ monthComparison: MonthComparison }>(MONTH_COMPARISON_QUERY);

  return useMemo(() => ({
    data: data?.monthComparison,
    loading,
    error,
  }), [isDemo ? localTransactions : transactions]);
}

export function useFinanceAnalytics(): FinanceAnalytics {
  const { transactions, summary } = useFinance();
  const { transactions: localTransactions, summary: localSummary } = useFinanceLocal();
  const { isDemo } = useAuth();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split('T')[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split('T')[0];
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const { data: _monthComparisonData, loading: _monthComparisonLoading, error: _monthComparisonError } = useQuery<{ monthComparison: MonthComparison }>(MONTH_COMPARISON_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: _categoryBreakdownData, loading: _categoryBreakdownLoading, error: _categoryBreakdownError } = useQuery<{ categoryBreakdown: CategorySpending[] }>(CATEGORY_BREAKDOWN_QUERY, {
    variables: { startDate: firstDay, endDate: lastDay },
    fetchPolicy: 'cache-and-network',
  });
  const { data: _dailySpendingData, loading: _dailySpendingLoading, error: _dailySpendingError } = useQuery<{ dailySpendingCapacity: number }>(DAILY_SPENDING_CAPACITY_QUERY, {
    fetchPolicy: 'cache-and-network',
  });
  const { data: _spendingByDayOfWeekData, loading: _spendingByDayOfWeekLoading, error: _spendingByDayOfWeekError } = useQuery<{ spendingByDayOfWeek: DaySpending[] }>(SPENDING_BY_DAY_OF_WEEK_QUERY, {
    variables: { startDate: firstDay, endDate: lastDay },
    fetchPolicy: 'cache-and-network',
  });
  const { data: _savingsRateData, loading: _savingsRateLoading, error: _savingsRateError } = useQuery<{ savingsRate: number }>(SAVINGS_RATE_QUERY, {
    variables: { months: currentMonth || 1 },
  });
  const { data: _smallExpensesData, loading: _smallExpensesLoading, error: _smallExpensesError } = useQuery<{ smallExpenses: SmallExpense[] }>(SMALL_EXPENSES_QUERY, {
    variables: { startDate: firstDay, endDate: lastDay, threshold: SMALL_EXPENSE_THRESHOLD },
    fetchPolicy: 'cache-and-network',
  });

  return useMemo(() => {

    // Helper to get month key
    const getMonthKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    // Filter expense transactions
    const expenseTransactions = isDemo ? localTransactions.filter(t =>
      t.type === 'FIXED_EXPENSE' || t.type === 'VARIABLE_EXPENSE'
    ) : transactions.filter(t =>
      t.type === 'FIXED_EXPENSE' || t.type === 'VARIABLE_EXPENSE'
    );

    const incomeTransactions = isDemo ? localTransactions.filter(t => t.type === 'INCOME') : transactions.filter(t => t.type === 'INCOME');

    // Current month transactions
    const currentMonthExpenses = expenseTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const currentMonthIncome = incomeTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });


    // Previous month transactions
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const previousMonthExpenses = expenseTransactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // 1. Top Categories
    const categoryTotals = new Map<TransactionCategory, number>();
    currentMonthExpenses.forEach(t => {
      const current = categoryTotals.get(t.category) || 0;
      categoryTotals.set(t.category, current + t.amount);
    });

    const previousCategoryTotals = new Map<TransactionCategory, number>();
    previousMonthExpenses.forEach(t => {
      const current = previousCategoryTotals.get(t.category) || 0;
      previousCategoryTotals.set(t.category, current + t.amount);
    });

    const totalCurrentExpenses = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);

    const topCategories: CategorySpending[] = Array.from(categoryTotals.entries())
      .map(([category, amount]) => {
        const previousAmount = previousCategoryTotals.get(category) || 0;
        return {
          category,
          label: getCategoryLabel(category),
          amount,
          percentage: totalCurrentExpenses > 0 ? (amount / totalCurrentExpenses) * 100 : 0,
          previousAmount,
          change: previousAmount > 0 ? ((amount - previousAmount) / previousAmount) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const topCategoryMessage = topCategories.length > 0
      ? `Este mes tu mayor gasto fue en ${topCategories[0].label} (${topCategories[0].percentage.toFixed(0)}%).`
      : 'No hay gastos registrados este mes.';

    // 2. Monthly Trends (last 6 months)
    const monthlyData = new Map<string, { income: number; expenses: number }>();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i, 1);
      const key = getMonthKey(date);
      monthlyData.set(key, { income: 0, expenses: 0 });
    }

     (isDemo ? localTransactions : transactions).forEach(t => {
      const date = new Date(t.date);
      const key = getMonthKey(date);
      if (monthlyData.has(key)) {
        const data = monthlyData.get(key)!;
        if (t.type === 'INCOME') {
          data.income += t.amount;
        } else {
          data.expenses += t.amount;
        }
      }
    });

    const monthlyTrends: MonthlyTrend[] = Array.from(monthlyData.entries()).map(([month, data]) => {
      const [year, monthNum] = month.split('-');
      return {
        month,
        monthLabel: MONTH_NAMES[parseInt(monthNum) - 1].slice(0, 3),
        income: data.income,
        expenses: data.expenses,
        balance: data.income - data.expenses,
        isPositive: data.income >= data.expenses,
      };
    });

    const negativeMonths = monthlyTrends.filter(m => !m.isPositive).length;
    let negativeMonthsStreak = 0;
    for (let i = monthlyTrends.length - 1; i >= 0; i--) {
      if (!monthlyTrends[i].isPositive) {
        negativeMonthsStreak++;
      } else {
        break;
      }
    }

    const trendMessage = negativeMonthsStreak > 0
      ? `Llevas ${negativeMonthsStreak} ${negativeMonthsStreak === 1 ? 'mes' : 'meses'} gastando más de lo que ganas.`
      : '¡Excelente! Tus ingresos superan tus gastos.';

    // 3. Savings Rate
    const totalIncome = isDemo ? localSummary.totalIncome : summary.totalIncome;
    const totalExpenses = isDemo ? localSummary.totalExpenses : summary.totalExpenses;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    const savingsPerHundred = Math.max(0, Math.round(savingsRate));

    let savingsRateLevel: 'critical' | 'warning' | 'good' | 'excellent';
    let savingsRateMessage: string;

    if (savingsRate < 5) {
      savingsRateLevel = 'critical';
      savingsRateMessage = 'Estás sobreviviendo. Intenta reducir gastos.';
    } else if (savingsRate < 15) {
      savingsRateLevel = 'warning';
      savingsRateMessage = 'Vas bien, pero puedes mejorar.';
    } else if (savingsRate < 25) {
      savingsRateLevel = 'good';
      savingsRateMessage = '¡Excelente disciplina financiera!';
    } else {
      savingsRateLevel = 'excellent';
      savingsRateMessage = '¡Increíble! Eres un maestro del ahorro.';
    }

    // 4. Small Expenses (Ant Expenses)
    const smallExpensesList = currentMonthExpenses.filter(t => t.amount <= SMALL_EXPENSE_THRESHOLD);
    const smallExpensesTotal = smallExpensesList.reduce((sum, t) => sum + t.amount, 0);

    const smallByCategory = new Map<string, { amount: number; count: number }>();
    smallExpensesList.forEach(t => {
      const label = getCategoryLabel(t.category);
      const current = smallByCategory.get(label) || { amount: 0, count: 0 };
      smallByCategory.set(label, {
        amount: current.amount + t.amount,
        count: current.count + 1
      });
    });

    const smallExpenses: SmallExpense[] = Array.from(smallByCategory.entries())
      .map(([category, data]) => ({ category, ...data }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const smallExpensesMessage = `Tus compras pequeñas sumaron $${smallExpensesTotal.toLocaleString()} este mes.`;

    // 5. Day of Week Spending
    const dayTotals = new Map<number, { total: number; count: number }>();
    for (let i = 0; i < 7; i++) {
      dayTotals.set(i, { total: 0, count: 0 });
    }

    currentMonthExpenses.forEach(t => {
      const date = new Date(t.date);
      const day = date.getDay();
      const current = dayTotals.get(day)!;
      dayTotals.set(day, {
        total: current.total + t.amount,
        count: current.count + 1
      });
    });

    const daySpending: DaySpending[] = Array.from(dayTotals.entries()).map(([day, data]) => ({
      dayOfWeek: day,
      dayName: DAY_NAMES[day],
      totalAmount: data.total,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
      transactionCount: data.count,
    }));

    const highestSpendingDayData = daySpending.reduce((max, d) =>
      d.totalAmount > max.totalAmount ? d : max, daySpending[0]
    );
    const highestSpendingDay = highestSpendingDayData?.dayName || 'N/A';

    const weekendSpending = (dayTotals.get(0)?.total || 0) + (dayTotals.get(6)?.total || 0);
    const weekdaySpending = [1, 2, 3, 4, 5].reduce((sum, d) => sum + (dayTotals.get(d)?.total || 0), 0);
    const weekendVsWeekdayRatio = weekdaySpending > 0 ? weekendSpending / (weekdaySpending / 5) : 0;

    const daySpendingMessage = weekendVsWeekdayRatio > 1.5
      ? `Los fines de semana gastas ${weekendVsWeekdayRatio.toFixed(1)}x más que entre semana.`
      : `Tu gasto es relativamente uniforme durante la semana.`;

    // 6. Fixed vs Variable Ratio
    const fixedTotal = isDemo ? localSummary.totalFixedExpenses : summary.totalFixedExpenses;
    const variableTotal = isDemo ? localSummary.totalVariableExpenses : summary.totalVariableExpenses;
    const expenseTotal = fixedTotal + variableTotal;

    const fixedPercentage = expenseTotal > 0 ? (fixedTotal / expenseTotal) * 100 : 0;
    const variablePercentage = expenseTotal > 0 ? (variableTotal / expenseTotal) * 100 : 0;

    const incomeCommittedPercentage = totalIncome > 0 ? (fixedTotal / totalIncome) * 100 : 0;
    const committedMessage = `El ${fixedPercentage.toFixed(0)}% de tu dinero ya está comprometido antes de empezar el mes.`;

    // 7. Month Comparison
    const currentMonthTotal = currentMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const previousMonthTotal = previousMonthExpenses.reduce((sum, t) => sum + t.amount, 0);
    const difference = currentMonthTotal - previousMonthTotal;
    const percentageChange = previousMonthTotal > 0
      ? Math.abs((difference / previousMonthTotal) * 100)
      : 0;
    const isImprovement = difference < 0;

    const monthComparisonMessage = isImprovement
      ? `Gastaste $${Math.abs(difference).toLocaleString()} menos que el mes pasado. ¡Bien ahí! 👏`
      : difference > 0
        ? `Tus gastos subieron ${percentageChange.toFixed(0)}% respecto al mes anterior.`
        : 'Tus gastos se mantienen estables.';

    // 8. End of Month Projection
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysRemaining = daysInMonth - dayOfMonth;

    const dailyAverageSpending = dayOfMonth > 0 ? currentMonthTotal / dayOfMonth : 0;
    const projectedSpending = currentMonthTotal + (dailyAverageSpending * daysRemaining);

    const currentMonthIncomeTotal = currentMonthIncome.reduce((sum, t) => sum + t.amount, 0);
    const projectedBalance = currentMonthIncomeTotal - projectedSpending;

    const projectionMessage = projectedBalance >= 0
      ? `A este ritmo, terminarás el mes con $${projectedBalance.toLocaleString()} libres.`
      : `Cuidado: vas a quedar en negativo por $${Math.abs(projectedBalance).toLocaleString()}.`;

    // 9. Category Comparison (already calculated above in topCategories)
    const categoryComparison = topCategories.filter(c => c.change !== 0);

    // 10. Best Month
    const bestMonthData = monthlyTrends.reduce((best, current) => {
      if (!best || current.balance > best.balance) {
        return current;
      }
      return best;
    }, null as MonthlyTrend | null);

    const bestMonth = bestMonthData && bestMonthData.balance > 0 ? {
      month: bestMonthData.month,
      monthLabel: bestMonthData.monthLabel,
      savings: bestMonthData.balance,
      savingsRate: bestMonthData.income > 0
        ? (bestMonthData.balance / bestMonthData.income) * 100
        : 0,
    } : null;

    let positiveMonthsStreak = 0;
    for (let i = monthlyTrends.length - 1; i >= 0; i--) {
      if (monthlyTrends[i].isPositive) {
        positiveMonthsStreak++;
      } else {
        break;
      }
    }

    // Bonus: Smart Insights
    const insights: string[] = [];

    // Insight: Category comparison
    if (topCategories.length >= 2) {
      const ocio = topCategories.find(c => c.category === 'entertainment');
      const comida = topCategories.find(c => c.category === 'food');
      if (ocio && comida && ocio.amount > comida.amount) {
        insights.push('Estás gastando más en ocio que en comida.');
      }
    }

    // Insight: Fixed expenses ratio
    if (incomeCommittedPercentage > 50) {
      insights.push('Tus gastos fijos ya ocupan más de la mitad de tu ingreso.');
    }

    // Insight: Daily savings tip
    if (dailyAverageSpending > 0) {
      const dailySaving = 5;
      const monthlySaving = dailySaving * 30;
      insights.push(`Reducir $${dailySaving} diarios te ahorra $${monthlySaving} al mes.`);
    }

    // Insight: Positive streak
    if (positiveMonthsStreak >= 3) {
      insights.push(`¡Llevas ${positiveMonthsStreak} meses consecutivos en positivo! 🎉`);
    }

    // Insight: Small expenses impact
    if (smallExpensesTotal > 0 && totalIncome > 0) {
      const smallPercentage = (smallExpensesTotal / totalIncome) * 100;
      if (smallPercentage > 5) {
        insights.push(`Los gastos hormiga representan el ${smallPercentage.toFixed(1)}% de tu ingreso.`);
      }
    }

    // Insight: Weekend spending
    if (weekendVsWeekdayRatio > 2) {
      insights.push('Tus fines de semana son muy costosos. Considera actividades gratuitas.');
    }

    return {
      topCategories,
      topCategoryMessage,
      monthlyTrends,
      trendMessage,
      negativeMonthsStreak,
      savingsRate,
      savingsRateLevel,
      savingsRateMessage,
      savingsPerHundred,
      smallExpenses,
      smallExpensesTotal,
      smallExpensesMessage,
      daySpending,
      highestSpendingDay,
      daySpendingMessage,
      weekendVsWeekdayRatio,
      fixedVsVariableRatio: {
        fixedPercentage,
        variablePercentage,
        committedMessage,
      },
      monthComparison: {
        currentMonthExpenses: currentMonthTotal,
        previousMonthExpenses: previousMonthTotal,
        difference,
        percentageChange,
        isImprovement,
        message: monthComparisonMessage,
      },
      projection: {
        projectedBalance,
        daysRemaining,
        dailyAverageSpending,
        projectedSpending,
        isPositive: projectedBalance >= 0,
        message: projectionMessage,
      },
      categoryComparison,
      bestMonth,
      positiveMonthsStreak,
      insights,
    };
  }, [isDemo ? [localTransactions,localSummary] : [transactions, summary]]);
}
