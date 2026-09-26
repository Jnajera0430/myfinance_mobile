import { useMemo } from 'react';
import { useQuery } from '@apollo/client/react';
import { useFinance } from '@/contexts/FinanceContext.graphql';
import { useAuth } from '@/contexts/AuthContext';
import { getCategoryLabel } from '@/lib/categories';
import type { Transaction } from '@/graphql/types';
import { MONTHLY_TREND_QUERY } from '@/graphql/operations';
import type { MonthlyTrend as ServerMonthlyTrend } from '@/graphql/types';

export interface CategorySpending {
  category: string;
  label: string;
  amount: number;
  percentage: number;
  previousAmount: number;
  change: number;
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

export interface FinanceAnalytics {
  isLoading: boolean;
  topCategories: CategorySpending[];
  topCategoryMessage: string;
  monthlyTrends: MonthlyTrend[];
  trendMessage: string;
  negativeMonthsStreak: number;
  savingsRate: number;
  savingsRateLevel: 'critical' | 'warning' | 'good' | 'excellent';
  savingsRateMessage: string;
  savingsPerHundred: number;
  smallExpenses: SmallExpense[];
  smallExpensesTotal: number;
  smallExpensesMessage: string;
  smallExpenseThreshold: number;
  daySpending: DaySpending[];
  highestSpendingDay: string;
  daySpendingMessage: string;
  weekendVsWeekdayRatio: number;
  fixedVsVariableRatio: {
    fixedPercentage: number;
    variablePercentage: number;
    committedMessage: string;
  };
  monthComparison: {
    currentMonthExpenses: number;
    previousMonthExpenses: number;
    difference: number;
    percentageChange: number;
    isImprovement: boolean;
    message: string;
  };
  projection: {
    projectedBalance: number;
    daysRemaining: number;
    dailyAverageSpending: number;
    projectedSpending: number;
    isPositive: boolean;
    message: string;
  };
  categoryComparison: CategorySpending[];
  bestMonth: { month: string; monthLabel: string; savings: number; savingsRate: number } | null;
  positiveMonthsStreak: number;
  insights: string[];
}

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const amount = (value: unknown): number => Number(value) || 0;

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

const transactionMonth = (transaction: Transaction) => transaction.date.slice(0, 7);

const sum = (transactions: Transaction[]) =>
  transactions.reduce((total, item) => total + amount(item.amount), 0);

const isExpense = (transaction: Transaction) =>
  transaction.type === 'FIXED_EXPENSE' || transaction.type === 'VARIABLE_EXPENSE';

/** Fechas del rango del mes actual (o desplazado) en formato YYYY-MM-DD. */
function monthRange(offset = 0): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
}

export { monthRange };

/**
 * Umbral de "gasto hormiga" relativo al ingreso del periodo,
 * para que tenga sentido en cualquier moneda.
 */
function antExpenseThreshold(monthlyIncome: number): number {
  if (monthlyIncome <= 0) return 20000;
  return Math.max(1, Math.round(monthlyIncome * 0.005));
}

export function useFinanceAnalytics(): FinanceAnalytics {
  const { transactions, summary, isLoading: transactionsLoading } = useFinance();
  const { isAuthenticated } = useAuth();

  // Unica consulta que se consume del servidor: la tendencia ya agrupada.
  // El resto se calcula localmente sobre las transacciones para que la
  // pantalla responda al instante y funcione con datos cacheados.
  const {
    data: serverMonthlyTrend,
    loading: serverTrendLoading,
  } = useQuery<{ monthlyTrend: ServerMonthlyTrend[] }>(MONTHLY_TREND_QUERY, {
    variables: { months: 6 },
    skip: !isAuthenticated,
  });

  return useMemo<FinanceAnalytics>(() => {
    const now = new Date();
    const currentKey = monthKey(now);
    const previousDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousKey = monthKey(previousDate);

    const expenses = transactions.filter(isExpense);
    const incomes = transactions.filter((t) => t.type === 'INCOME');

    const currentMonthExpenses = expenses.filter((t) => transactionMonth(t) === currentKey);
    const currentMonthIncomes = incomes.filter((t) => transactionMonth(t) === currentKey);
    const previousMonthExpenses = expenses.filter((t) => transactionMonth(t) === previousKey);

    const currentMonthExpenseTotal = sum(currentMonthExpenses);
    const currentMonthIncomeTotal = sum(currentMonthIncomes);
    const previousMonthExpenseTotal = sum(previousMonthExpenses);

    // 1. Categorimas con mayor gasto
    const categoryTotals = new Map<string, number>();
    currentMonthExpenses.forEach((t) => {
      categoryTotals.set(t.category, (categoryTotals.get(t.category) ?? 0) + amount(t.amount));
    });

    const previousCategoryTotals = new Map<string, number>();
    previousMonthExpenses.forEach((t) => {
      previousCategoryTotals.set(
        t.category,
        (previousCategoryTotals.get(t.category) ?? 0) + amount(t.amount),
      );
    });

    const topCategories: CategorySpending[] = Array.from(categoryTotals.entries())
      .map(([category, value]) => {
        const previousAmount = previousCategoryTotals.get(category) ?? 0;
        return {
          category,
          label: getCategoryLabel(category),
          amount: value,
          percentage:
            currentMonthExpenseTotal > 0 ? (value / currentMonthExpenseTotal) * 100 : 0,
          previousAmount,
          change: previousAmount > 0 ? ((value - previousAmount) / previousAmount) * 100 : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    const topFive = topCategories.slice(0, 5);
    const topCategoryMessage = topFive.length
      ? `Este mes tu mayor gasto fue ${topFive[0].label} (${Math.round(topFive[0].percentage)}%).`
      : 'Aún no hay gastos registrados este mes.';

    // 2. Tendencia de los ultimos 6 meses
    const buckets = new Map<string, { income: number; expenses: number }>();
    for (let i = 5; i >= 0; i--) {
      buckets.set(monthKey(new Date(now.getFullYear(), now.getMonth() - i, 1)), {
        income: 0,
        expenses: 0,
      });
    }

    transactions.forEach((t) => {
      const key = transactionMonth(t);
      const bucket = buckets.get(key);
      if (!bucket) return;
      if (t.type === 'INCOME') bucket.income += amount(t.amount);
      else bucket.expenses += amount(t.amount);
    });

    const monthlyTrends: MonthlyTrend[] = Array.from(buckets.entries()).map(([month, data]) => ({
      month,
      monthLabel: MONTH_NAMES[Number(month.slice(5, 7)) - 1].slice(0, 3),
      income: data.income,
      expenses: data.expenses,
      balance: data.income - data.expenses,
      isPositive: data.income - data.expenses >= 0 && data.income > 0,
    }));

    let negativeMonthsStreak = 0;
    for (let i = monthlyTrends.length - 1; i >= 0; i--) {
      if (!monthlyTrends[i].isPositive && monthlyTrends[i].expenses > 0) negativeMonthsStreak++;
      else break;
    }

    const trendMessage =
      negativeMonthsStreak > 0
        ? `Llevas ${negativeMonthsStreak} ${
            negativeMonthsStreak === 1 ? 'mes' : 'meses'
          } gastando más de lo que ganas.`
        : currentMonthExpenseTotal > 0 || currentMonthIncomeTotal > 0
          ? '¡Bien! Tus ingresos cubren tus gastos.'
          : 'Registra movimientos para ver tu tendencia.';

    // 3. Tasa de ahorro (6 meses, coherente con la tendencia)
    const sixMonthIncome = monthlyTrends.reduce((total, item) => total + item.income, 0);
    const sixMonthExpenses = monthlyTrends.reduce((total, item) => total + item.expenses, 0);
    const savingsBase = sixMonthIncome > 0 ? sixMonthIncome : amount(summary.totalIncome);
    const savingsCompare = sixMonthIncome > 0 ? sixMonthExpenses : amount(summary.totalExpenses);
    const savings = savingsBase - savingsCompare;
    const savingsRate = savingsBase > 0 ? (savings / savingsBase) * 100 : 0;
    const savingsPerHundred = Math.max(0, Math.round(savingsRate));

    let savingsRateLevel: FinanceAnalytics['savingsRateLevel'] = 'critical';
    let savingsRateMessage = 'Estás sobreviviendo. Intenta reducir gastos.';

    if (savingsRate >= 25) {
      savingsRateLevel = 'excellent';
      savingsRateMessage = '¡Increíble! Eres un maestro del ahorro.';
    } else if (savingsRate >= 15) {
      savingsRateLevel = 'good';
      savingsRateMessage = '¡Excelente disciplina financiera!';
    } else if (savingsRate >= 5) {
      savingsRateLevel = 'warning';
      savingsRateMessage = 'Vas bien, pero puedes mejorar.';
    }

    // 4. Gastos hormiga
    const threshold = antExpenseThreshold(currentMonthIncomeTotal);
    const smallList = currentMonthExpenses.filter((t) => amount(t.amount) <= threshold);
    const smallExpensesTotal = sum(smallList);

    const smallByCategory = new Map<string, { amount: number; count: number }>();
    smallList.forEach((t) => {
      const label = getCategoryLabel(t.category);
      const current2 = smallByCategory.get(label) ?? { amount: 0, count: 0 };
      smallByCategory.set(label, {
        amount: current2.amount + amount(t.amount),
        count: current2.count + 1,
      });
    });

    const smallExpenses: SmallExpense[] = Array.from(smallByCategory.entries())
      .map(([category, data]) => ({ category, amount: data.amount, count: data.count }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const smallExpensesMessage =
      smallList.length > 0
        ? `Tus ${smallList.length} compras pequeñas sumaron ${smallExpensesTotal.toLocaleString(
            'es-CO',
          )} este mes.`
        : 'Aún no registras compras pequeñas este mes.';

    // 5. Gasto por dia de la semana
    const dayTotals = new Map<number, { total: number; count: number }>();
    for (let day = 0; day < 7; day++) dayTotals.set(day, { total: 0, count: 0 });

    currentMonthExpenses.forEach((t) => {
      const day = new Date(`${t.date}T00:00:00`).getDay();
      const data = dayTotals.get(day);
      if (!data) return;
      data.total += amount(t.amount);
      data.count += 1;
    });

    const daySpending: DaySpending[] = Array.from(dayTotals.entries()).map(([day, data]) => ({
      dayOfWeek: day,
      dayName: DAY_NAMES[day],
      totalAmount: data.total,
      averageAmount: data.count > 0 ? data.total / data.count : 0,
      transactionCount: data.count,
    }));

    const highestSpendingDay =
      daySpending.reduce((best, item) => (item.totalAmount > best.totalAmount ? item : best), daySpending[0])
        ?.dayName ?? 'N/A';

    const weekendSpending = (dayTotals.get(0)?.total ?? 0) + (dayTotals.get(6)?.total ?? 0);
    const weekdaySpending = [1, 2, 3, 4, 5].reduce(
      (total, day) => total + (dayTotals.get(day)?.total ?? 0),
      0,
    );
    const weekendVsWeekdayRatio = weekdaySpending > 0 ? weekendSpending / (weekdaySpending / 5) : 0;

    const daySpendingMessage =
      weekendVsWeekdayRatio > 1.5
        ? `Los fines de semana gastas ${weekendVsWeekdayRatio.toFixed(1)}x más que entre semana.`
        : 'Tu gasto es bastante uniforme durante la semana.';

    // 6. Fijo vs variable
    const fixedTotal = sum(currentMonthExpenses.filter((t) => t.type === 'FIXED_EXPENSE'));
    const variableTotal = sum(
      currentMonthExpenses.filter((t) => t.type === 'VARIABLE_EXPENSE'),
    );
    const expenseTotal = fixedTotal + variableTotal;
    const fixedPercentage = expenseTotal > 0 ? (fixedTotal / expenseTotal) * 100 : 0;
    const variablePercentage = expenseTotal > 0 ? (variableTotal / expenseTotal) * 100 : 0;
    const committedPercentage =
      currentMonthIncomeTotal > 0 ? (fixedTotal / currentMonthIncomeTotal) * 100 : 0;
    const committedMessage =
      expenseTotal > 0
        ? `El ${Math.round(fixedPercentage)}% de lo que gastas este mes ya estaba comprometido.`
        : 'Registra tus gastos fijos para ver esta proporción.';

    // 7. Comparacion mes a mes
    const difference = currentMonthExpenseTotal - previousMonthExpenseTotal;
    const percentageChange =
      previousMonthExpenseTotal > 0
        ? Math.abs((difference / previousMonthExpenseTotal) * 100)
        : currentMonthExpenseTotal > 0
          ? 100
          : 0;
    const isImprovement = difference < 0;

    const monthComparison = {
      currentMonthExpenses: currentMonthExpenseTotal,
      previousMonthExpenses: previousMonthExpenseTotal,
      difference,
      percentageChange,
      isImprovement,
      message: isImprovement
        ? `Gastaste ${Math.abs(difference).toLocaleString('es-CO')} menos que el mes pasado. ¡Bien ahí! 👏`
        : difference > 0
          ? `Tus gastos subieron ${Math.round(percentageChange)}% respecto al mes anterior.`
          : 'Tus gastos se mantienen estables.',
    };

    // 8. Proyeccion a fin de mes
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(0, daysInMonth - dayOfMonth);
    const dailyAverageSpending = dayOfMonth > 0 ? currentMonthExpenseTotal / dayOfMonth : 0;
    const projectedSpending = currentMonthExpenseTotal + dailyAverageSpending * daysRemaining;
    const projectedBalance = currentMonthIncomeTotal - projectedSpending;

    const projection = {
      projectedBalance,
      daysRemaining,
      dailyAverageSpending,
      projectedSpending,
      isPositive: projectedBalance >= 0,
      message:
        currentMonthExpenseTotal === 0
          ? 'Registra gastos para proyectar tu fin de mes.'
          : projectedBalance >= 0
            ? `A este ritmo terminarás el mes con ${Math.round(projectedBalance).toLocaleString('es-CO')} libres.`
            : `Cuidado: quedarías en negativo por ${Math.abs(Math.round(projectedBalance)).toLocaleString('es-CO')}.`,
    };

    // 9. Mejor mes y rachas
    const bestCandidate = monthlyTrends.reduce<MonthlyTrend | null>(
      (best, item) => (!best || item.balance > best.balance ? item : best),
      null,
    );

    const bestMonth =
      bestCandidate && bestCandidate.balance > 0
        ? {
            month: bestCandidate.month,
            monthLabel: bestCandidate.monthLabel,
            savings: bestCandidate.balance,
            savingsRate:
              bestCandidate.income > 0 ? (bestCandidate.balance / bestCandidate.income) * 100 : 0,
          }
        : null;

    let positiveMonthsStreak = 0;
    for (let i = monthlyTrends.length - 1; i >= 0; i--) {
      if (monthlyTrends[i].isPositive) positiveMonthsStreak++;
      else break;
    }

    // 10. Insights inteligentes
    const insights: string[] = [];

    const ocio = topFive.find((item) => item.category === 'entertainment');
    const comida = topFive.find((item) => item.category === 'food');
    if (ocio && comida && ocio.amount > comida.amount) {
      insights.push('Este mes gastaste más en ocio que en comida.');
    }

    if (committedPercentage > 50) {
      insights.push('Tus gastos fijos ya superan la mitad de tu ingreso mensual.');
    }

    if (dailyAverageSpending > 0) {
      const monthlySaving = Math.round(dailyAverageSpending * 0.1 * daysInMonth);
      insights.push(
        `Recortar 10% de tu gasto diario te deja ${monthlySaving.toLocaleString('es-CO')} más al mes.`,
      );
    }

    if (positiveMonthsStreak >= 3) {
      insights.push(`¡Llevas ${positiveMonthsStreak} meses consecutivos en positivo! 🎉`);
    }

    if (smallExpensesTotal > 0 && currentMonthIncomeTotal > 0) {
      const smallPercentage = (smallExpensesTotal / currentMonthIncomeTotal) * 100;
      if (smallPercentage > 5) {
        insights.push(
          `Los gastos hormiga ya son el ${smallPercentage.toFixed(1)}% de lo que ganas este mes.`,
        );
      }
    }

    if (weekendVsWeekdayRatio > 2) {
      insights.push('Tus fines de semana son costosos: prueba planes gratuitos.');
    }

    if (insights.length === 0) {
      insights.push(
        'Sigue registrando movimientos: en unos días tendrás recomendaciones personalizadas.',
      );
    }

    return {
      isLoading: transactionsLoading || serverTrendLoading,
      topCategories: topFive,
      topCategoryMessage,
      monthlyTrends: serverMonthlyTrend?.monthlyTrend?.length
        ? serverMonthlyTrend.monthlyTrend.map((item) => ({
            month: item.month,
            monthLabel: item.monthLabel.slice(0, 3),
            income: amount(item.totalIncome),
            expenses: amount(item.totalExpenses),
            balance: amount(item.balance),
            isPositive: !!item.isPositive,
          }))
        : monthlyTrends,
      trendMessage,
      negativeMonthsStreak,
      savingsRate,
      savingsRateLevel,
      savingsRateMessage,
      savingsPerHundred,
      smallExpenses,
      smallExpensesTotal,
      smallExpensesMessage,
      smallExpenseThreshold: threshold,
      daySpending,
      highestSpendingDay,
      daySpendingMessage,
      weekendVsWeekdayRatio,
      fixedVsVariableRatio: { fixedPercentage, variablePercentage, committedMessage },
      monthComparison,
      projection,
      categoryComparison: topFive.filter((item) => item.change !== 0),
      bestMonth,
      positiveMonthsStreak,
      insights,
    };
  }, [
    transactions,
    summary,
    transactionsLoading,
    serverTrendLoading,
    serverMonthlyTrend,
  ]);
}
