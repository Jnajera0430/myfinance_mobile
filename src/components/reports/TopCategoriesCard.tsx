import { View, Text } from 'react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { getCategoryColor } from '@/lib/categories';
import { clamp } from '@/lib/utils';
import type { CategorySpending } from '@/hooks/useFinanceAnalytics';
import { Card, CardHeader, EmptyState } from '@/components/ui/Card';

interface TopCategoriesCardProps {
  categories: CategorySpending[];
  message: string;
}

export default function TopCategoriesCard({ categories, message }: TopCategoriesCardProps) {
  const { formatAmount } = usePrivacy();
  const max = Math.max(...categories.map((item) => item.amount), 1);

  return (
    <Card>
      <CardHeader title="¿En qué se va tu dinero?" subtitle="Top 5 categorías del mes" />

      {categories.length === 0 ? (
        <EmptyState emoji="📊" title="Sin gastos este mes" description="Cuando registres gastos verás aquí el desglose." />
      ) : (
        <View>
          {categories.map((item, index) => (
            <View key={item.category} className="mb-3">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-sm text-foreground font-medium" numberOfLines={1}>
                  {index + 1}. {item.label}
                </Text>
                <Text className="text-sm font-bold text-foreground">{formatAmount(item.amount)}</Text>
              </View>

              <View className="h-2 bg-muted rounded-full overflow-hidden">
                <View
                  style={{
                    width: `${clamp((item.amount / max) * 100, 5, 100)}%`,
                    height: '100%',
                    backgroundColor: getCategoryColor(item.category),
                    borderRadius: 999,
                  }}
                />
              </View>

              <View className="flex-row justify-between mt-1">
                <Text className="text-[11px] text-muted-foreground">
                  {Math.round(item.percentage)}% de tus gastos
                </Text>
                {item.previousAmount > 0 && (
                  <Text
                    className="text-[11px] font-semibold"
                    style={{ color: item.change > 0 ? '#ef4444' : '#22c55e' }}
                  >
                    {item.change > 0 ? '▲' : '▼'} {Math.abs(Math.round(item.change))}% vs mes anterior
                  </Text>
                )}
              </View>
            </View>
          ))}

          <Text className="text-xs text-muted-foreground mt-1">{message}</Text>
        </View>
      )}
    </Card>
  );
}
