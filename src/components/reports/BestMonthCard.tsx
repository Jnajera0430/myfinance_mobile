// src/components/finance/BestMonthCard.tsx
import { View, Text } from 'react-native';
import { Trophy, Flame, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { cn } from '@/lib/utils';

interface BestMonthCardProps {
  bestMonth: {
    month: string;
    monthLabel: string;
    savings: number;
    savingsRate: number;
  } | null;
  positiveStreak: number;
}

const MONTH_NAMES: Record<string, string> = {
  'Ene': 'Enero',
  'Feb': 'Febrero',
  'Mar': 'Marzo',
  'Abr': 'Abril',
  'May': 'Mayo',
  'Jun': 'Junio',
  'Jul': 'Julio',
  'Ago': 'Agosto',
  'Sep': 'Septiembre',
  'Oct': 'Octubre',
  'Nov': 'Noviembre',
  'Dic': 'Diciembre',
};

const BestMonthCard = ({ bestMonth, positiveStreak }: BestMonthCardProps) => {
  const { formatAmount } = usePrivacy();

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="bg-card rounded-2xl overflow-hidden border border-border"
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={['rgba(99,102,241,0.2)', 'rgba(168,85,247,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="p-5"
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg font-semibold text-foreground">🏆 Tu mejor mes</Text>
        </View>
      </LinearGradient>

      <View className="p-5 space-y-4">
        {bestMonth ? (
          <>
            {/* Trophy display */}
            <View className="items-center py-4">
              <LinearGradient
                colors={['#facc15', '#f59e0b']} // yellow-400 to amber-500
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-20 h-20 rounded-full items-center justify-center mb-3"
              >
                <Trophy size={40} color="white" />
              </LinearGradient>
              <Text className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {MONTH_NAMES[bestMonth.monthLabel] || bestMonth.monthLabel}
              </Text>
              <Text className="text-sm text-muted-foreground">Tu mes más ahorrador</Text>
            </View>

            {/* Stats - two columns using flex row */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-income/10 rounded-xl p-4 items-center">
                <Star size={20} className="text-income mb-2" />
                <Text className="text-2xl font-bold text-income hide-amount">
                  {formatAmount(bestMonth.savings)}
                </Text>
                <Text className="text-xs text-muted-foreground text-center">Ahorro logrado</Text>
              </View>
              <View className="flex-1 bg-primary/20 rounded-xl p-4 items-center">
                <Trophy size={20} className="text-primary mb-2" />
                <Text className="text-2xl font-bold text-primary">
                  {bestMonth.savingsRate.toFixed(0)}%
                </Text>
                <Text className="text-xs text-muted-foreground text-center">Tasa de ahorro</Text>
              </View>
            </View>
          </>
        ) : (
          <View className="items-center py-8">
            <View className="w-16 h-16 rounded-full bg-muted items-center justify-center mb-3">
              <Trophy size={32} className="text-muted-foreground" />
            </View>
            <Text className="text-muted-foreground text-center">
              Aún no hay datos suficientes para determinar tu mejor mes.
            </Text>
          </View>
        )}

        {/* Streak */}
        {positiveStreak > 0 && (
          <LinearGradient
            colors={['rgba(34,197,94,0.2)', 'rgba(99,102,241,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl p-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="p-2 bg-income/30 rounded-lg">
                <Flame size={24} className="text-income" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-income">
                  🔥 Racha de {positiveStreak} {positiveStreak === 1 ? 'mes' : 'meses'}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  Consecutivos en positivo. ¡Sigue así!
                </Text>
              </View>
            </View>
          </LinearGradient>
        )}
      </View>
    </LinearGradient>
  );
};

export default BestMonthCard;