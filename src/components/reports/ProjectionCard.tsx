import { View, Text } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Card, CardHeader } from '@/components/ui/Card';

interface ProjectionCardProps {
  projectedBalance: number;
  daysRemaining: number;
  dailyAverageSpending: number;
  projectedSpending: number;
  isPositive: boolean;
  message: string;
}

export default function ProjectionCard({
  projectedBalance,
  daysRemaining,
  dailyAverageSpending,
  projectedSpending,
  isPositive,
  message,
}: ProjectionCardProps) {
  const { formatAmount } = usePrivacy();

  return (
    <Card>
      <CardHeader
        title="Proyección a fin de mes"
        subtitle="Qué pasará si sigues con este ritmo"
        right={
          <View
            className={`rounded-full px-2.5 py-1 ${
              isPositive ? 'bg-income/15' : 'bg-destructive/15'
            }`}
          >
            <Text
              className={`text-[10px] font-bold ${
                isPositive ? 'text-income' : 'text-destructive'
              }`}
            >
              {isPositive ? 'En verde' : 'En rojo'}
            </Text>
          </View>
        }
      />

      <View className="items-center py-3">
        <Text className="text-xs text-muted-foreground">Balance estimado al cerrar el mes</Text>
        <Text
          className="text-3xl font-bold mt-1"
          style={{ color: isPositive ? '#22c55e' : '#ef4444' }}
        >
          {formatAmount(projectedBalance)}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <View className="flex-1 rounded-2xl bg-muted/60 p-3">
          <Text className="text-[11px] text-muted-foreground">Ritmo diario</Text>
          <Text className="text-sm font-bold text-foreground mt-0.5">
            {formatAmount(dailyAverageSpending)}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-muted/60 p-3">
          <Text className="text-[11px] text-muted-foreground">Gasto del mes</Text>
          <Text className="text-sm font-bold text-foreground mt-0.5" numberOfLines={1}>
            {formatAmount(projectedSpending)}
          </Text>
        </View>
        <View className="flex-1 rounded-2xl bg-muted/60 p-3">
          <Text className="text-[11px] text-muted-foreground">Faltan</Text>
          <Text className="text-sm font-bold text-foreground mt-0.5">
            {daysRemaining} {daysRemaining === 1 ? 'día' : 'días'}
          </Text>
        </View>
      </View>

      <Text className="text-xs text-muted-foreground mt-3">{message}</Text>
    </Card>
  );
}
