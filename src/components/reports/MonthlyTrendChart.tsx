import { View, Text, ScrollView } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { clamp } from '@/lib/utils';
import type { MonthlyTrend } from '@/hooks/useFinanceAnalytics';
import { Card, CardHeader, EmptyState } from '@/components/ui/Card';

interface MonthlyTrendChartProps {
  trends: MonthlyTrend[];
  message: string;
  negativeStreak: number;
}

export default function MonthlyTrendChart({
  trends,
  message,
  negativeStreak,
}: MonthlyTrendChartProps) {
  const { formatAmount } = usePrivacy();

  const hasData = trends.some((item) => item.income > 0 || item.expenses > 0);
  const max = Math.max(...trends.map((item) => Math.max(item.income, item.expenses)), 1);

  return (
    <Card>
      <CardHeader
        title="Tendencia de los últimos 6 meses"
        subtitle="Ingresos vs gastos por mes"
        right={
          negativeStreak > 0 ? (
            <View className="rounded-full bg-destructive/10 px-2.5 py-1">
              <Text className="text-[10px] font-bold text-destructive">
                {negativeStreak} {negativeStreak === 1 ? 'mes en rojo' : 'meses en rojo'}
              </Text>
            </View>
          ) : undefined
        }
      />

      {!hasData ? (
        <EmptyState
          emoji="📈"
          title="Aún no hay historial"
          description="Registra movimientos durante un par de meses para ver tu tendencia."
        />
      ) : (
        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row items-end gap-4 px-1" style={{ height: 170 }}>
              {trends.map((item) => {
                const incomeHeight = clamp((item.income / max) * 120, 2, 120);
                const expenseHeight = clamp((item.expenses / max) * 120, 2, 120);

                return (
                  <View key={item.month} className="items-center" style={{ width: 48 }}>
                    <View className="flex-row items-end gap-1" style={{ height: 124 }}>
                      <View
                        style={{ height: incomeHeight, width: 12, backgroundColor: '#22c55e', borderRadius: 6 }}
                      />
                      <View
                        style={{ height: expenseHeight, width: 12, backgroundColor: '#ef4444', borderRadius: 6 }}
                      />
                    </View>

                    <Text className="text-[10px] font-semibold text-muted-foreground mt-2">
                      {item.monthLabel}
                    </Text>
                    <Text
                      className="text-[10px] font-bold"
                      style={{ color: item.isPositive ? '#22c55e' : '#ef4444' }}
                    >
                      {item.isPositive ? '+' : ''}
                      {Math.round(item.balance / 1000)}k
                    </Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>

          <View className="flex-row gap-4 mt-3 pt-3 border-t border-border">
            <View className="flex-row items-center gap-1.5">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#22c55e' }} />
              <Text className="text-[11px] text-muted-foreground">Ingresos</Text>
            </View>
            <View className="flex-row items-center gap-1.5">
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' }} />
              <Text className="text-[11px] text-muted-foreground">Gastos</Text>
            </View>
          </View>

          <Text className="text-xs text-muted-foreground mt-3">{message}</Text>
        </View>
      )}
    </Card>
  );
}
