import { View, Text } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Card, CardHeader } from '@/components/ui/Card';

interface MonthComparisonCardProps {
  currentMonthExpenses: number;
  previousMonthExpenses: number;
  difference: number;
  percentageChange: number;
  isImprovement: boolean;
  message: string;
}

export default function MonthComparisonCard({
  currentMonthExpenses,
  previousMonthExpenses,
  difference,
  percentageChange,
  isImprovement,
  message,
}: MonthComparisonCardProps) {
  const { formatAmount } = usePrivacy();

  const max = Math.max(currentMonthExpenses, previousMonthExpenses, 1);
  const noPrevious = previousMonthExpenses === 0;

  return (
    <Card>
      <CardHeader title="Mes contra mes" subtitle="Tus gastos frente al mes anterior" />

      <View className="flex-row gap-3 my-2">
        <View className="flex-1 rounded-2xl bg-muted/60 p-3">
          <Text className="text-[11px] text-muted-foreground">Mes pasado</Text>
          <Text className="text-base font-bold text-foreground" numberOfLines={1}>
            {formatAmount(previousMonthExpenses)}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-secondary p-3">
          <Text className="text-[11px] text-secondary-foreground">Este mes</Text>
          <Text className="text-base font-bold text-primary" numberOfLines={1}>
            {formatAmount(currentMonthExpenses)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-end gap-2 mt-2 mb-3" style={{ height: 60 }}>
        <View className="flex-1 items-center">
          <View
            style={{
              width: 28,
              height: Math.max((previousMonthExpenses / max) * 52, 4),
              backgroundColor: '#cbd5e1',
              borderRadius: 8,
            }}
          />
        </View>
        <View className="flex-1 items-center">
          <View
            style={{
              width: 28,
              height: Math.max((currentMonthExpenses / max) * 52, 4),
              backgroundColor: isImprovement || noPrevious ? '#22c55e' : '#ef4444',
              borderRadius: 8,
            }}
          />
        </View>
      </View>

      <View
        className={`rounded-2xl px-4 py-3 ${
          noPrevious
            ? 'bg-muted'
            : isImprovement
              ? 'bg-income/10'
              : difference === 0
                ? 'bg-muted'
                : 'bg-destructive/10'
        }`}
      >
        <Text
          className="text-sm font-bold"
          style={{
            color: noPrevious ? '#64748b' : isImprovement ? '#22c55e' : difference === 0 ? '#64748b' : '#ef4444',
          }}
        >
          {noPrevious
            ? 'Primer mes con datos'
            : difference === 0
              ? 'Igual que el mes pasado'
              : `${isImprovement ? 'Bajaron' : 'Subieron'} ${Math.round(percentageChange)}%`}
        </Text>
        {!noPrevious && difference !== 0 && (
          <Text className="text-xs text-muted-foreground mt-0.5">
            Diferencia de {formatAmount(Math.abs(difference))}
          </Text>
        )}
      </View>

      <Text className="text-xs text-muted-foreground mt-3">{message}</Text>
    </Card>
  );
}
