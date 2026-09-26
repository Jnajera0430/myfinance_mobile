import { View, Text } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { clamp } from '@/lib/utils';
import type { DaySpending } from '@/hooks/useFinanceAnalytics';
import { Card, CardHeader, EmptyState } from '@/components/ui/Card';

interface DaySpendingCardProps {
  daySpending: DaySpending[];
  highestDay: string;
  message: string;
  weekendRatio: number;
}

export default function DaySpendingCard({
  daySpending,
  highestDay,
  message,
  weekendRatio,
}: DaySpendingCardProps) {
  const { formatAmount } = usePrivacy();

  const max = Math.max(...daySpending.map((item) => item.totalAmount), 1);
  const hasData = daySpending.some((item) => item.totalAmount > 0);

  return (
    <Card>
      <CardHeader
        title="¿Cuándo gastas más?"
        subtitle="Distribución por día de la semana"
        right={
          weekendRatio > 0 ? (
            <View className="rounded-full bg-primary/10 px-2.5 py-1">
              <Text className="text-[10px] font-bold text-primary">
                finde ×{weekendRatio.toFixed(1)}
              </Text>
            </View>
          ) : undefined
        }
      />

      {!hasData ? (
        <EmptyState
          emoji="📅"
          title="Sin gastos este mes"
          description="Registra tus gastos y te diremos qué día se te va más dinero."
        />
      ) : (
        <View>
          {daySpending.map((item) => {
            const isWeekend = item.dayOfWeek === 0 || item.dayOfWeek === 6;
            const isHighest = item.dayName === highestDay && item.totalAmount > 0;

            return (
              <View key={item.dayOfWeek} className="flex-row items-center mb-2">
                <Text
                  className={`w-10 text-xs font-medium ${
                    isWeekend ? 'text-expense-variable' : 'text-muted-foreground'
                  }`}
                >
                  {item.dayName.slice(0, 3)}
                </Text>

                <View className="flex-1 h-2.5 bg-muted rounded-full overflow-hidden mx-2">
                  <View
                    style={{
                      width: `${clamp((item.totalAmount / max) * 100, item.totalAmount > 0 ? 6 : 0, 100)}%`,
                      height: '100%',
                      backgroundColor: isHighest ? '#ef4444' : isWeekend ? '#f59e0b' : '#6366f1',
                      borderRadius: 999,
                    }}
                  />
                </View>

                <Text className="w-20 text-right text-xs text-foreground" numberOfLines={1}>
                  {item.totalAmount > 0 ? formatAmount(item.totalAmount) : '—'}
                </Text>
              </View>
            );
          })}

          <Text className="text-xs text-muted-foreground mt-2">{message}</Text>
        </View>
      )}
    </Card>
  );
}
