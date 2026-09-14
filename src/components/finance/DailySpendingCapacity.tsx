import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CalendarDays, Wallet, TrendingUp, Sparkles } from 'lucide-react-native';
import { differenceInDays, addMonths, setDate } from 'date-fns';
import { useFinance } from '../../contexts/FinanceContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
// import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const DailySpendingCapacity = () => {
  const { summary, payday } = useFinance();
//   const { summary: summaryLocal, payday: paydayLocal } = useFinanceLocal();
//   const { isDemo } = useAuth();
  const { formatAmount, isIncognito } = usePrivacy();

  // Calculate days remaining until payday or end of month
  const today = new Date();
  const currentDay = today.getDate();
//   const paydayToUse = isDemo ? paydayLocal : payday;
  const paydayToUse = payday;

  let nextPayday: Date;
  if (currentDay >= paydayToUse) {
    // Next payday is in the next month
    nextPayday = setDate(addMonths(today, 1), paydayToUse);
  } else {
    // Next payday is this month
    nextPayday = setDate(today, paydayToUse);
  }

  const daysRemaining = Math.max(1, differenceInDays(nextPayday, today));

  // Calculate daily spending capacity
//   const remainingBalance = isDemo ? summaryLocal.totalBalance : summary.totalBalance;
  const remainingBalance = summary.totalBalance;
  const dailyCapacity = remainingBalance > 0 ? remainingBalance / daysRemaining : 0;

  // Determine status based on daily capacity
  const getStatus = () => {
    if (dailyCapacity >= 500) {
      return {
        emoji: '🎉',
        message: '¡Excelente! Tienes buen margen',
        color: 'text-income',
        bgColor: 'bg-income/20',
      };
    } else if (dailyCapacity >= 200) {
      return {
        emoji: '👍',
        message: 'Vas bien, sigue así',
        color: 'text-primary',
        bgColor: 'bg-primary/20',
      };
    } else if (dailyCapacity >= 100) {
      return {
        emoji: '🤔',
        message: 'Ajustado, pero manejable',
        color: 'text-expense-variable',
        bgColor: 'bg-expense-variable/20',
      };
    } else if (dailyCapacity > 0) {
      return {
        emoji: '😰',
        message: 'Cuidado con tus gastos',
        color: 'text-expense-fixed',
        bgColor: 'bg-expense-fixed/20',
      };
    } else {
      return {
        emoji: '🔴',
        message: 'Sin presupuesto disponible',
        color: 'text-destructive',
        bgColor: 'bg-destructive/20',
      };
    }
  };

  const status = getStatus();

  return (
    <View className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border relative">
      {/* PRO badge - absolute positioned */}
      <View className="absolute top-3 right-3 z-10">
        <LinearGradient
          colors={['rgba(99,102,241,0.2)', 'rgba(168,85,247,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="flex-row items-center gap-1 px-2 py-0.5 rounded-full border border-primary/20"
        >
          <Sparkles size={12} color="#6366f1" />
          <Text className="text-xs font-medium text-primary">PRO</Text>
        </LinearGradient>
      </View>

      <View className="p-5">
        <View className="flex-row items-start gap-4">
          <View className={cn('p-3 rounded-2xl', status.bgColor)}>
            <Wallet size={24} className={status.color} />
          </View>

          <View className="flex-1">
            <Text className="text-sm font-medium text-muted-foreground mb-1">
              Capacidad de Gasto Diario
            </Text>

            <View className="flex-row items-baseline gap-2 mb-2">
              <Text className={cn('text-3xl font-bold hide-amount', status.color)}>
                {formatAmount(dailyCapacity)}
              </Text>
              <Text className="text-sm text-muted-foreground">por día</Text>
              <Text className="text-2xl ml-1">{status.emoji}</Text>
            </View>

            <Text className="text-sm text-muted-foreground mb-4">{status.message}</Text>

            {/* Stats row */}
            <View className="flex-row items-center gap-6 pt-4 border-t border-border/50">
              <View className="flex-row items-center gap-2">
                <CalendarDays size={16} className="text-muted-foreground" />
                <View>
                  <Text className="text-xs text-muted-foreground">Días restantes</Text>
                  <Text className="font-semibold text-foreground">
                    {isIncognito ? '**' : daysRemaining}
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center gap-2">
                <TrendingUp size={16} className="text-muted-foreground" />
                <View>
                  <Text className="text-xs text-muted-foreground">Saldo disponible</Text>
                  <Text
                    className={cn(
                      'font-semibold hide-amount',
                      remainingBalance >= 0 ? 'text-income' : 'text-expense-fixed'
                    )}
                  >
                    {formatAmount(remainingBalance)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export default DailySpendingCapacity;