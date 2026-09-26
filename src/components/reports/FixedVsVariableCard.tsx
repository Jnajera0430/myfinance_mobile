import { View, Text } from 'react-native';
import { Card, CardHeader } from '@/components/ui/Card';

interface FixedVsVariableCardProps {
  fixedPercentage: number;
  variablePercentage: number;
  message: string;
}

export default function FixedVsVariableCard({
  fixedPercentage,
  variablePercentage,
  message,
}: FixedVsVariableCardProps) {
  const total = fixedPercentage + variablePercentage;
  const fixedWidth = total > 0 ? (fixedPercentage / total) * 100 : 0;

  return (
    <Card>
      <CardHeader title="Comprometido vs flexible" subtitle="Qué parte de tu gasto puedes mover" />

      <View className="h-4 rounded-full overflow-hidden flex-row bg-muted my-3">
        <View style={{ width: `${fixedWidth}%`, backgroundColor: '#ef4444' }} />
        <View style={{ width: `${100 - fixedWidth}%`, backgroundColor: '#f59e0b' }} />
      </View>

      <View className="flex-row justify-between">
        <View>
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#ef4444' }} />
            <Text className="text-xs text-muted-foreground">Fijos</Text>
          </View>
          <Text className="text-lg font-bold text-expense-fixed mt-1">
            {Math.round(fixedPercentage)}%
          </Text>
        </View>

        <View className="items-end">
          <View className="flex-row items-center gap-1.5">
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#f59e0b' }} />
            <Text className="text-xs text-muted-foreground">Variables</Text>
          </View>
          <Text className="text-lg font-bold text-expense-variable mt-1">
            {Math.round(variablePercentage)}%
          </Text>
        </View>
      </View>

      <Text className="text-xs text-muted-foreground mt-3">{message}</Text>
    </Card>
  );
}
