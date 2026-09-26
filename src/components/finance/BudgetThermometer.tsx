import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Flame, Snowflake, AlertTriangle } from 'lucide-react-native';
import { useFinance } from '../../contexts/FinanceContext.graphql';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { cn } from '../../lib/utils';

type Status = {
  label: string;
  emoji: string;
  gradient: readonly [string, string];
  bgColor: string;
  hex: string;
  icon: typeof Flame;
  message: string;
};

const BudgetThermometer = () => {
  const { summary } = useFinance();
  const { formatAmount, isIncognito } = usePrivacy();

  const spentPercentage =
    summary.totalIncome > 0 ? Math.min((summary.totalExpenses / summary.totalIncome) * 100, 100) : 0;

  const getStatus = (): Status => {
    if (spentPercentage <= 50) {
      return {
        label: '¡Vas muy bien!',
        emoji: '😎',
        gradient: ['#22c55e', '#16a34a'],
        bgColor: 'bg-income/15',
        hex: '#22c55e',
        icon: Snowflake,
        message: 'Buen control de tus gastos',
      };
    }
    if (spentPercentage <= 75) {
      return {
        label: 'Cuidado',
        emoji: '🤔',
        gradient: ['#f59e0b', '#ea580c'],
        bgColor: 'bg-expense-variable/15',
        hex: '#f59e0b',
        icon: AlertTriangle,
        message: 'Ya comprometiste más de la mitad',
      };
    }
    if (spentPercentage <= 90) {
      return {
        label: '¡Ojo!',
        emoji: '😰',
        gradient: ['#ef4444', '#dc2626'],
        bgColor: 'bg-expense-fixed/15',
        hex: '#ef4444',
        icon: Flame,
        message: 'Te queda poco margen',
      };
    }
    return {
      label: '¡Límite!',
      emoji: '🔥',
      gradient: ['#ef4444', '#b91c1c'],
      bgColor: 'bg-destructive/15',
      hex: '#dc2626',
      icon: Flame,
      message: 'Gastaste casi todo tu ingreso',
    };
  };

  const status = getStatus();
  const Icon = status.icon;
  const remaining = summary.totalIncome - summary.totalExpenses;
  const hasData = summary.totalIncome > 0 || summary.totalExpenses > 0;

  if (!hasData) {
    return (
      <View className="rounded-3xl border border-border bg-card p-5">
        <Text className="text-base font-semibold text-foreground">Termómetro de gastos</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Registra un ingreso y algunos gastos para ver cuánto de tu dinero ya está comprometido.
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center gap-3 flex-1 min-w-0">
          <View className={cn('w-10 h-10 rounded-2xl items-center justify-center', status.bgColor)}>
            <Icon size={20} color={status.hex} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-foreground text-base">Termómetro de gastos</Text>
            <Text className="text-xs text-muted-foreground" numberOfLines={1}>
              {status.message}
            </Text>
          </View>
        </View>
        <View className="items-end ml-2">
          <Text className="text-xl">{status.emoji}</Text>
          <Text className="text-xs font-semibold" style={{ color: status.hex }}>
            {status.label}
          </Text>
        </View>
      </View>

      <View className="relative my-2">
        <View className="h-3 bg-muted rounded-full overflow-hidden">
          <LinearGradient
            colors={status.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${Math.max(spentPercentage, 2)}%`, height: '100%', borderRadius: 999 }}
          />
        </View>
      </View>

      <View className="flex-row justify-between mt-2">
        <Text className="text-[10px] text-muted-foreground">0%</Text>
        <Text className="text-[10px] text-muted-foreground">50%</Text>
        <Text className="text-[10px] text-muted-foreground">100%</Text>
      </View>

      <View className="flex-row justify-between items-end mt-4 pt-4 border-t border-border">
        <View>
          <Text className="text-xs text-muted-foreground">Gastado</Text>
          <Text className="text-base font-bold" style={{ color: status.hex }}>
            {formatAmount(summary.totalExpenses)}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-muted-foreground">De tus ingresos</Text>
          <Text className="text-base font-bold text-foreground">
            {isIncognito ? '••%' : `${spentPercentage.toFixed(0)}%`}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted-foreground">Te queda</Text>
          <Text
            className="text-base font-bold"
            style={{ color: remaining >= 0 ? '#22c55e' : '#ef4444' }}
          >
            {formatAmount(remaining)}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default BudgetThermometer;
