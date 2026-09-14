// src/components/finance/BudgetThermometer.tsx
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Snowflake, AlertTriangle } from 'lucide-react-native';
import { useFinance } from '../../contexts/FinanceContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { cn } from '../../lib/utils';

const BudgetThermometer = () => {
  const { summary } = useFinance();
  const { formatAmount, isIncognito } = usePrivacy();

  // Calculate percentage of income spent
  const spentPercentage = summary.totalIncome > 0
    ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100)
    : 0;

  // Determine status and colors
  const getStatus = () => {
    if (spentPercentage <= 50) {
      return {
        label: '¡Vas muy bien!',
        emoji: '😎',
        gradient: ['hsl(var(--income))', 'hsl(142 76% 46%)'] as const,
        bgColor: 'bg-income/20',
        textColor: 'text-income',
        icon: Snowflake,
        message: 'Tienes buen control de tus gastos',
      };
    } else if (spentPercentage <= 75) {
      return {
        label: 'Cuidado',
        emoji: '🤔',
        gradient: ['hsl(var(--expense-variable))', 'hsl(25 95% 53%)'] as const,
        bgColor: 'bg-expense-variable/20',
        textColor: 'text-expense-variable',
        icon: AlertTriangle,
        message: 'Ya gastaste más de la mitad',
      };
    } else if (spentPercentage <= 90) {
      return {
        label: '¡Ojo!',
        emoji: '😰',
        gradient: ['hsl(var(--expense-fixed))', 'hsl(0 84% 60%)'] as const,
        bgColor: 'bg-expense-fixed/20',
        textColor: 'text-expense-fixed',
        icon: Flame,
        message: 'Te queda poco presupuesto',
      };
    } else {
      return {
        label: '¡Límite!',
        emoji: '🔥',
        gradient: ['hsl(0 84% 60%)', 'hsl(0 72% 51%)'] as const,
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400',
        icon: Flame,
        message: 'Has agotado casi todo tu ingreso',
      };
    }
  };

  const status = getStatus();
  const Icon = status.icon;
  const remaining = summary.totalIncome - summary.totalExpenses;

  return (
    <View className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border">
      <View className="p-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-3">
            <View className={cn('p-2 rounded-xl', status.bgColor)}>
              <Icon size={20} className={status.textColor} />
            </View>
            <View>
              <Text className="font-semibold text-foreground text-base">
                Termómetro de Gastos
              </Text>
              <Text className="text-xs text-muted-foreground">{status.message}</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-2xl">{status.emoji}</Text>
            <Text className={cn('text-sm font-medium', status.textColor)}>
              {status.label}
            </Text>
          </View>
        </View>

        {/* Thermometer Bar */}
        <View className="relative my-2">
          <View className="h-8 bg-muted/50 rounded-full overflow-hidden">
            <LinearGradient
              colors={status.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: `${spentPercentage}%`,
                height: '100%',
                borderRadius: 999,
              }}
            />
          </View>

          {/* Markers (0%, 50%, 100%) */}
          <View className="absolute inset-x-0 top-0 h-8 flex-row justify-between items-center px-2 pointer-events-none">
            <Text className="text-xs font-medium text-foreground/70">0%</Text>
            <Text className="text-xs font-medium text-foreground/70">50%</Text>
            <Text className="text-xs font-medium text-foreground/70">100%</Text>
          </View>

          {/* Vertical marker at 50% */}
          <View className="absolute left-1/2 top-0 w-px h-8 bg-foreground/20" />
        </View>

        {/* Stats */}
        <View className="flex-row justify-between items-center mt-4 pt-4 border-t border-border/50">
          <View>
            <Text className="text-xs text-muted-foreground">Gastado</Text>
            <Text className={cn('text-lg font-bold hide-amount', status.textColor)}>
              {formatAmount(summary.totalExpenses)}
            </Text>
          </View>
          <View className="items-center">
            <Text className="text-xs text-muted-foreground">De tus ingresos</Text>
            <Text className="text-lg font-bold text-foreground">
              {isIncognito ? '**%' : `${spentPercentage.toFixed(0)}%`}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-xs text-muted-foreground">Te queda</Text>
            <Text
              className={cn(
                'text-lg font-bold hide-amount',
                remaining >= 0 ? 'text-income' : 'text-expense-fixed'
              )}
            >
              {formatAmount(remaining)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default BudgetThermometer;