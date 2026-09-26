import { View, Text, FlatList, Dimensions } from 'react-native';
import { useFinanceAnalytics } from '../../hooks/useFinanceAnalytics';
import { useFinance } from '../../contexts/FinanceContext.graphql';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { formatAmount } from '../../lib/format';
import { useSettings } from '../../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Insight {
  id: string;
  emoji: string;
  title: string;
  value: string;
  hint: string;
  color: string;
}

export default function QuickInsightsCarousel() {
  const { insights, savingsRate, topCategories, projection } = useFinanceAnalytics();
  const { summary } = useFinance();
  const { currency, language } = useSettings();
  const { formatAmount: maskedFormat } = usePrivacy();

  const items: Insight[] = [
    {
      id: 'balance',
      emoji: '💼',
      title: 'Tu balance',
      value: maskedFormat(summary.totalBalance),
      hint: 'Ingresos menos gastos',
      color: '#6366f1',
    },
    {
      id: 'savings',
      emoji: '🐖',
      title: 'Tasa de ahorro',
      value: `${Math.round(savingsRate)}%`,
      hint: savingsRate >= 10 ? 'Vas mejor que el promedio' : 'Intenta llegar al 10%',
      color: savingsRate >= 10 ? '#22c55e' : '#f59e0b',
    },
    {
      id: 'top',
      emoji: '📌',
      title: 'Mayor gasto',
      value: topCategories[0]?.label ?? 'Sin datos',
      hint: topCategories[0]
        ? `${formatAmount(topCategories[0].amount, currency, language)} este mes`
        : 'Aún no registras gastos',
      color: '#ef4444',
    },
    {
      id: 'projection',
      emoji: '🔮',
      title: 'Cierre de mes',
      value: formatAmount(projection.projectedBalance, currency, language),
      hint: `Faltan ${projection.daysRemaining} días`,
      color: projection.isPositive ? '#22c55e' : '#ef4444',
    },
  ];

  const smartInsight = insights[0];

  return (
    <View>
      <FlatList
        horizontal
        data={items}
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCREEN_WIDTH * 0.72}
        decelerationRate="fast"
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: SCREEN_WIDTH * 0.66,
              marginLeft: index === 0 ? 0 : 12,
              borderColor: `${item.color}33`,
            }}
            className="rounded-3xl border bg-card p-4"
          >
            <Text className="text-2xl">{item.emoji}</Text>
            <Text className="text-xs text-muted-foreground mt-2" numberOfLines={1}>
              {item.title}
            </Text>
            <Text
              className="text-lg font-bold mt-0.5"
              style={{ color: item.color }}
              numberOfLines={1}
            >
              {item.value}
            </Text>
            <Text className="text-[11px] text-muted-foreground mt-1" numberOfLines={2}>
              {item.hint}
            </Text>
          </View>
        )}
      />

      {!!smartInsight && (
        <View className="mt-3 rounded-2xl bg-secondary px-4 py-3 flex-row items-center">
          <Text className="text-base mr-2">💡</Text>
          <Text className="text-xs text-secondary-foreground flex-1" numberOfLines={2}>
            {smartInsight}
          </Text>
        </View>
      )}
    </View>
  );
}
