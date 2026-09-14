// src/screens/ReportsScreen.tsx
import { useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useFinanceAnalytics } from '@/hooks/useFinanceAnalytics';
import { 
  BarChart3, 
  PiggyBank, 
  Calendar, 
  TrendingUp,
  Brain,
  Trophy
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '@/lib/utils';

// Import converted report components (adjust paths as needed)
import TopCategoriesCard from '@/components/reports/TopCategoriesCard';
import MonthlyTrendChart from '@/components/reports/MonthlyTrendChart';
import SavingsRateCard from '@/components/reports/SavingsRateCard';
import SmallExpensesCard from '@/components/reports/SmallExpensesCard';
import DaySpendingCard from '@/components/reports/DaySpendingCard';
import FixedVsVariableCard from '@/components/reports/FixedVsVariableCard';
import MonthComparisonCard from '@/components/reports/MonthComparisonCard';
import ProjectionCard from '@/components/reports/ProjectionCard';
import BestMonthCard from '@/components/reports/BestMonthCard';
import InsightsCard from '@/components/reports/InsightsCard';

type TabId = 'spending' | 'trends' | 'savings' | 'patterns' | 'projection' | 'achievements';

interface TabConfig {
  id: TabId;
  label: string;
  icon: React.ElementType;
}

const tabs: TabConfig[] = [
  { id: 'spending', label: 'Gastos', icon: BarChart3 },
  { id: 'trends', label: 'Tendencias', icon: TrendingUp },
  { id: 'savings', label: 'Ahorro', icon: PiggyBank },
  { id: 'patterns', label: 'Patrones', icon: Calendar },
  { id: 'projection', label: 'Proyección', icon: Brain },
  { id: 'achievements', label: 'Logros', icon: Trophy },
];

const ReportsScreen = () => {
  const analytics = useFinanceAnalytics();
  const [activeTab, setActiveTab] = useState<TabId>('spending');

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 pt-6 pb-8 space-y-6">
          {/* Header */}
          <View className="space-y-2">
            <Text className="text-3xl font-bold text-foreground">📊 Entiende tu dinero</Text>
            <Text className="text-muted-foreground">
              Analiza tus hábitos financieros y toma mejores decisiones.
            </Text>
          </View>

          {/* Insights Banner */}
          <InsightsCard insights={analytics.insights} />

          {/* Custom Tab Bar */}
          <View className="mt-2">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              <View className="flex-row gap-1 bg-muted/50 p-1 rounded-lg">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <TouchableOpacity
                      key={tab.id}
                      onPress={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex-row items-center gap-2 px-4 py-2 rounded-md",
                        isActive ? "bg-primary shadow-sm" : "bg-transparent"
                      )}
                    >
                      <Icon size={16} className={isActive ? "text-primary-foreground" : "text-muted-foreground"} />
                      <Text className={cn(
                        "text-sm font-medium",
                        isActive ? "text-primary-foreground" : "text-muted-foreground"
                      )}>
                        {tab.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {/* Tab Content */}
          <View className="mt-4 space-y-6">
            {activeTab === 'spending' && (
              <View className="space-y-6">
                <View className="flex-row flex-wrap gap-4">
                  <View className="flex-1 min-w-[48%]">
                    <TopCategoriesCard 
                      categories={analytics.topCategories}
                      message={analytics.topCategoryMessage}
                    />
                  </View>
                  <View className="flex-1 min-w-[48%]">
                    <FixedVsVariableCard
                      fixedPercentage={analytics.fixedVsVariableRatio.fixedPercentage}
                      variablePercentage={analytics.fixedVsVariableRatio.variablePercentage}
                      message={analytics.fixedVsVariableRatio.committedMessage}
                    />
                  </View>
                </View>
                <SmallExpensesCard
                  expenses={analytics.smallExpenses}
                  total={analytics.smallExpensesTotal}
                  message={analytics.smallExpensesMessage}
                />
              </View>
            )}

            {activeTab === 'trends' && (
              <View className="space-y-6">
                <MonthlyTrendChart
                  trends={analytics.monthlyTrends}
                  message={analytics.trendMessage}
                  negativeStreak={analytics.negativeMonthsStreak}
                />
                <MonthComparisonCard
                  currentMonthExpenses={analytics.monthComparison.currentMonthExpenses}
                  previousMonthExpenses={analytics.monthComparison.previousMonthExpenses}
                  difference={analytics.monthComparison.difference}
                  percentageChange={analytics.monthComparison.percentageChange}
                  isImprovement={analytics.monthComparison.isImprovement}
                  message={analytics.monthComparison.message}
                />
              </View>
            )}

            {activeTab === 'savings' && (
              <View className="space-y-6">
                <View className="flex-row flex-wrap gap-4">
                  <View className="flex-1 min-w-[48%]">
                    <SavingsRateCard
                      rate={analytics.savingsRate}
                      level={analytics.savingsRateLevel}
                      message={analytics.savingsRateMessage}
                      perHundred={analytics.savingsPerHundred}
                    />
                  </View>
                  <View className="flex-1 min-w-[48%]">
                    <BestMonthCard
                      bestMonth={analytics.bestMonth}
                      positiveStreak={analytics.positiveMonthsStreak}
                    />
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'patterns' && (
              <View className="space-y-6">
                <DaySpendingCard
                  daySpending={analytics.daySpending}
                  highestDay={analytics.highestSpendingDay}
                  message={analytics.daySpendingMessage}
                  weekendRatio={analytics.weekendVsWeekdayRatio}
                />
              </View>
            )}

            {activeTab === 'projection' && (
              <View className="space-y-6">
                <View className="flex-row flex-wrap gap-4">
                  <View className="flex-1 min-w-[48%]">
                    <ProjectionCard
                      projectedBalance={analytics.projection.projectedBalance}
                      daysRemaining={analytics.projection.daysRemaining}
                      dailyAverageSpending={analytics.projection.dailyAverageSpending}
                      projectedSpending={analytics.projection.projectedSpending}
                      isPositive={analytics.projection.isPositive}
                      message={analytics.projection.message}
                    />
                  </View>
                  <View className="flex-1 min-w-[48%]">
                    <MonthComparisonCard
                      currentMonthExpenses={analytics.monthComparison.currentMonthExpenses}
                      previousMonthExpenses={analytics.monthComparison.previousMonthExpenses}
                      difference={analytics.monthComparison.difference}
                      percentageChange={analytics.monthComparison.percentageChange}
                      isImprovement={analytics.monthComparison.isImprovement}
                      message={analytics.monthComparison.message}
                    />
                  </View>
                </View>
              </View>
            )}

            {activeTab === 'achievements' && (
              <View className="space-y-6">
                <BestMonthCard
                  bestMonth={analytics.bestMonth}
                  positiveStreak={analytics.positiveMonthsStreak}
                />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ReportsScreen;