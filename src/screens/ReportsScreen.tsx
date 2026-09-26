import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, TrendingUp, PiggyBank, Calendar } from 'lucide-react-native';
import { useFinanceAnalytics } from '@/hooks/useFinanceAnalytics';
import { cn } from '@/lib/utils';

import InsightsCard from '@/components/reports/InsightsCard';
import TopCategoriesCard from '@/components/reports/TopCategoriesCard';
import FixedVsVariableCard from '@/components/reports/FixedVsVariableCard';
import SmallExpensesCard from '@/components/reports/SmallExpensesCard';
import MonthlyTrendChart from '@/components/reports/MonthlyTrendChart';
import MonthComparisonCard from '@/components/reports/MonthComparisonCard';
import SavingsRateCard from '@/components/reports/SavingsRateCard';
import BestMonthCard from '@/components/reports/BestMonthCard';
import DaySpendingCard from '@/components/reports/DaySpendingCard';
import ProjectionCard from '@/components/reports/ProjectionCard';
import { Card } from '@/components/ui/Card';

type Section = 'spending' | 'trends' | 'savings' | 'patterns';

const SECTIONS = [
  { id: 'spending' as Section, label: 'Gastos', icon: BarChart3 },
  { id: 'trends' as Section, label: 'Tendencia', icon: TrendingUp },
  { id: 'savings' as Section, label: 'Ahorro', icon: PiggyBank },
  { id: 'patterns' as Section, label: 'Ritmo', icon: Calendar },
];

export default function ReportsScreen() {
  const analytics = useFinanceAnalytics();
  const [section, setSection] = useState<Section>('spending');

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground">Entiende tu dinero</Text>
        <Text className="text-sm text-muted-foreground mt-0.5 mb-4">
          Patrones, comparaciones y proyecciones con tus movimientos.
        </Text>

        <InsightsCard insights={analytics.insights} />

        <View className="flex-row gap-1 bg-muted rounded-2xl p-1 mt-4 mb-4">
          {SECTIONS.map((item) => {
            const Icon = item.icon;
            const active = section === item.id;

            return (
              <TouchableOpacity
                key={item.id}
                onPress={() => setSection(item.id)}
                className={cn(
                  'flex-1 rounded-xl py-2 items-center',
                  active ? 'bg-primary' : 'bg-transparent',
                )}
              >
                <Icon size={15} color={active ? '#ffffff' : '#64748b'} />
                <Text
                  className={cn(
                    'text-[11px] font-semibold mt-0.5',
                    active ? 'text-white' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {section === 'spending' && (
          <View>
            <TopCategoriesCard
              categories={analytics.topCategories}
              message={analytics.topCategoryMessage}
            />
            <View className="h-4" />
            <FixedVsVariableCard
              fixedPercentage={analytics.fixedVsVariableRatio.fixedPercentage}
              variablePercentage={analytics.fixedVsVariableRatio.variablePercentage}
              message={analytics.fixedVsVariableRatio.committedMessage}
            />
            <View className="h-4" />
            <SmallExpensesCard
              expenses={analytics.smallExpenses}
              total={analytics.smallExpensesTotal}
              message={analytics.smallExpensesMessage}
            />
          </View>
        )}

        {section === 'trends' && (
          <View>
            <MonthlyTrendChart
              trends={analytics.monthlyTrends}
              message={analytics.trendMessage}
              negativeStreak={analytics.negativeMonthsStreak}
            />
            <View className="h-4" />
            <MonthComparisonCard {...analytics.monthComparison} />
          </View>
        )}

        {section === 'savings' && (
          <View>
            <SavingsRateCard
              rate={analytics.savingsRate}
              level={analytics.savingsRateLevel}
              message={analytics.savingsRateMessage}
              perHundred={analytics.savingsPerHundred}
            />
            <View className="h-4" />
            <BestMonthCard
              bestMonth={analytics.bestMonth}
              positiveStreak={analytics.positiveMonthsStreak}
            />
          </View>
        )}

        {section === 'patterns' && (
          <View>
            <DaySpendingCard
              daySpending={analytics.daySpending}
              highestDay={analytics.highestSpendingDay}
              message={analytics.daySpendingMessage}
              weekendRatio={analytics.weekendVsWeekdayRatio}
            />
            <View className="h-4" />
            <ProjectionCard {...analytics.projection} />
          </View>
        )}

        <Card className="mt-4">
          <Text className="text-xs text-muted-foreground">
            Los cálculos usan únicamente los movimientos que has registrado. Las proyecciones
            asumen que mantienes tu ritmo actual de gasto.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
