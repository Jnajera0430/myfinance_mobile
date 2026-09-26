import { View, Text } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import type { SmallExpense } from '@/hooks/useFinanceAnalytics';
import { Card, CardHeader, EmptyState } from '@/components/ui/Card';

interface SmallExpensesCardProps {
  expenses: SmallExpense[];
  total: number;
  message: string;
}

export default function SmallExpensesCard({ expenses, total, message }: SmallExpensesCardProps) {
  const { formatAmount } = usePrivacy();

  return (
    <Card>
      <CardHeader
        title="Gastos hormiga 🐜"
        subtitle="Compras pequeñas que suman sin que las notes"
        right={
          total > 0 ? (
            <View className="rounded-full bg-expense-variable/15 px-3 py-1">
              <Text className="text-xs font-bold text-expense-variable">{formatAmount(total)}</Text>
            </View>
          ) : undefined
        }
      />

      {expenses.length === 0 ? (
        <EmptyState
          emoji="✨"
          title="Cero gastos hormiga"
          description="Este mes no registras compras pequeñas. ¡Buen control!"
        />
      ) : (
        <View>
          {expenses.map((item, index) => (
            <View
              key={item.category}
              className={`flex-row items-center justify-between py-2.5 ${
                index > 0 ? 'border-t border-border' : ''
              }`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm text-foreground font-medium" numberOfLines={1}>
                  {item.category}
                </Text>
                <Text className="text-[11px] text-muted-foreground">
                  {item.count} {item.count === 1 ? 'compra' : 'compras'}
                </Text>
              </View>
              <Text className="text-sm font-bold text-foreground">{formatAmount(item.amount)}</Text>
            </View>
          ))}

          <Text className="text-xs text-muted-foreground mt-2">{message}</Text>
        </View>
      )}
    </Card>
  );
}
