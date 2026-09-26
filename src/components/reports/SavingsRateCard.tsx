import { View, Text } from 'react-native';
import { Card, CardHeader } from '@/components/ui/Card';

interface SavingsRateCardProps {
  rate: number;
  level: 'critical' | 'warning' | 'good' | 'excellent';
  message: string;
  perHundred: number;
}

const LEVELS = {
  critical: { color: '#ef4444', label: 'En riesgo', bg: 'bg-destructive/10' },
  warning: { color: '#f59e0b', label: 'Mejorable', bg: 'bg-expense-variable/10' },
  good: { color: '#6366f1', label: 'Sano', bg: 'bg-primary/10' },
  excellent: { color: '#22c55e', label: 'Excelente', bg: 'bg-income/10' },
} as const;

export default function SavingsRateCard({ rate, level, message, perHundred }: SavingsRateCardProps) {
  const config = LEVELS[level];

  return (
    <Card>
      <CardHeader title="Tasa de ahorro" subtitle="Lo que te queda después de gastar" />

      <View className="items-center py-3">
        <Text className="text-4xl font-bold" style={{ color: config.color }}>
          {Math.round(rate)}%
        </Text>
        <View className={`rounded-full px-3 py-1 mt-2 ${config.bg}`}>
          <Text className="text-xs font-bold" style={{ color: config.color }}>
            {config.label}
          </Text>
        </View>
      </View>

      <View className="rounded-2xl bg-muted p-3 mb-3">
        <Text className="text-sm text-center text-foreground">
          Por cada <Text className="font-bold">$100</Text> que ganas, ahorras{' '}
          <Text className="font-bold" style={{ color: config.color }}>
            ${perHundred}
          </Text>
        </Text>
      </View>

      <Text className="text-xs text-muted-foreground text-center">{message}</Text>
    </Card>
  );
}
