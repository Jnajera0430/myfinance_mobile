import { View, Text } from 'react-native';
import { Wallet, CalendarDays, TrendingUp, Sparkles } from 'lucide-react-native';
import { useFinance } from '../../contexts/FinanceContext.graphql';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { cn } from '../../lib/utils';

const DailySpendingCapacity = () => {
  const { summary, payday } = useFinance();
  const { formatAmount, isIncognito } = usePrivacy();

  const today = new Date();
  const currentDay = today.getDate();

  // Ciclo entre pagos: dias que faltan para el proximo dia de pago
  const daysInCycle = payday > 0 ? payday : 15;
  const daysRemaining = currentDay <= daysInCycle
    ? daysInCycle - currentDay + 1
    : Math.max(1, 30 - currentDay + daysInCycle);

  const remainingBalance = summary.totalBalance;
  const dailyCapacity = remainingBalance > 0 ? remainingBalance / daysRemaining : 0;

  // Referencia relativa a los ingresos, no a un monto fijo:
  // asi el estado tiene sentido en COP, USD o MXN.
  const dailyIncomeReference =
    summary.totalIncome > 0 ? summary.totalIncome / Math.max(daysInCycle, 1) : 0;

  const ratio = dailyIncomeReference > 0 ? dailyCapacity / dailyIncomeReference : 0;

  const getStatus = () => {
    if (dailyCapacity <= 0) {
      return { emoji: '🔴', message: 'Sin saldo disponible para el resto del ciclo', hex: '#ef4444', bg: 'bg-destructive/15' };
    }
    if (ratio >= 1.2) {
      return { emoji: '🎉', message: 'Tienes margen de sobra para ahorrar', hex: '#22c55e', bg: 'bg-income/15' };
    }
    if (ratio >= 0.8) {
      return { emoji: '👍', message: 'Vas balanceado, sigue así', hex: '#6366f1', bg: 'bg-primary/15' };
    }
    if (ratio >= 0.4) {
      return { emoji: '🤔', message: 'Ajustado: cuida los gastos variables', hex: '#f59e0b', bg: 'bg-expense-variable/15' };
    }
    return { emoji: '😰', message: 'Muy apretado para llegar al próximo pago', hex: '#ef4444', bg: 'bg-expense-fixed/15' };
  };

  const status = getStatus();
  const hasData = summary.totalIncome > 0 || summary.totalExpenses > 0;

  if (!hasData) {
    return (
      <View className="rounded-3xl border border-border bg-card p-5">
        <Text className="text-base font-semibold text-foreground">Capacidad de gasto diario</Text>
        <Text className="text-sm text-muted-foreground mt-1">
          Registra tu ingreso y tus gastos: te diremos cuánto puedes usar cada día sin sustos.
        </Text>
      </View>
    );
  }

  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-foreground">Capacidad de gasto diario</Text>
        <View className="flex-row items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1">
          <Sparkles size={12} color="#6366f1" />
          <Text className="text-[10px] font-bold text-primary">PRO</Text>
        </View>
      </View>

      <View className="flex-row items-start gap-4">
        <View className={cn('w-12 h-12 rounded-2xl items-center justify-center', status.bg)}>
          <Wallet size={22} color={status.hex} />
        </View>

        <View className="flex-1">
          <View className="flex-row items-baseline gap-2">
            <Text className="text-2xl font-bold" style={{ color: status.hex }}>
              {formatAmount(dailyCapacity)}
            </Text>
            <Text className="text-sm text-muted-foreground">por día {status.emoji}</Text>
          </View>
          <Text className="text-sm text-muted-foreground mt-1">{status.message}</Text>

          <View className="flex-row gap-5 mt-4 pt-4 border-t border-border">
            <View className="flex-row items-center gap-2 flex-1">
              <CalendarDays size={16} color="#64748b" />
              <View>
                <Text className="text-[10px] text-muted-foreground">Días restantes</Text>
                <Text className="text-sm font-semibold text-foreground">
                  {isIncognito ? '••' : daysRemaining}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 flex-1">
              <TrendingUp size={16} color="#64748b" />
              <View>
                <Text className="text-[10px] text-muted-foreground">Saldo del ciclo</Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: remainingBalance >= 0 ? '#22c55e' : '#ef4444' }}
                >
                  {formatAmount(remainingBalance)}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DailySpendingCapacity;
