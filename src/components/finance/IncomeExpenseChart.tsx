import { View, Text } from 'react-native';
import { useFinance } from '../../contexts/FinanceContext.graphql';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { clamp } from '../../lib/utils';

interface Slice {
  key: string;
  label: string;
  value: number;
  color: string;
}

/**
 * Distribucion ingresos vs gastos.
 * Sustituye el grafico Victory (libreria web) por barras proporcionales nativas.
 */
const IncomeExpenseChart = () => {
  const { summary } = useFinance();
  const { formatAmount } = usePrivacy();

  const slices: Slice[] = [
    { key: 'income', label: 'Ingresos', value: summary.totalIncome, color: '#22c55e' },
    { key: 'fixed', label: 'Gastos fijos', value: summary.totalFixedExpenses, color: '#ef4444' },
    { key: 'variable', label: 'Gastos variables', value: summary.totalVariableExpenses, color: '#f59e0b' },
  ].filter((slice) => slice.value > 0);

  const max = Math.max(...slices.map((slice) => slice.value), 1);

  if (slices.length === 0) {
    return (
      <View className="rounded-3xl border border-border bg-card p-5">
        <Text className="text-base font-semibold text-foreground mb-2">Distribución financiera</Text>
        <Text className="text-sm text-muted-foreground text-center py-6">
          Aún no hay datos suficientes. Registra tu primer ingreso y tus gastos.
        </Text>
      </View>
    );
  }

  const committed = summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome) * 100 : 0;

  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-foreground">Distribución financiera</Text>
        {summary.totalIncome > 0 && (
          <Text
            className="text-xs font-semibold"
            style={{ color: committed > 90 ? '#ef4444' : committed > 70 ? '#f59e0b' : '#22c55e' }}
          >
            {Math.round(committed)}% comprometido
          </Text>
        )}
      </View>

      <View>
        {slices.map((slice) => (
          <View key={slice.key} className="mb-3">
            <View className="flex-row justify-between items-center mb-1.5">
              <View className="flex-row items-center gap-2">
                <View
                  style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: slice.color }}
                />
                <Text className="text-sm text-muted-foreground">{slice.label}</Text>
              </View>
              <Text className="text-sm font-semibold text-foreground">{formatAmount(slice.value)}</Text>
            </View>

            <View className="h-2.5 bg-muted rounded-full overflow-hidden">
              <View
                style={{
                  width: `${clamp((slice.value / max) * 100, 4, 100)}%`,
                  height: '100%',
                  backgroundColor: slice.color,
                  borderRadius: 999,
                }}
              />
            </View>
          </View>
        ))}
      </View>

      <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-border">
        <Text className="text-xs text-muted-foreground">Balance</Text>
        <Text
          className="text-sm font-bold"
          style={{ color: summary.totalBalance >= 0 ? '#22c55e' : '#ef4444' }}
        >
          {formatAmount(summary.totalBalance)}
        </Text>
      </View>
    </View>
  );
};

export default IncomeExpenseChart;
