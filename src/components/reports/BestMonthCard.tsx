import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Flame, Star } from 'lucide-react-native';
import { usePrivacy } from '@/contexts/PrivacyContext';
import { Card, CardHeader, EmptyState } from '@/components/ui/Card';

interface BestMonthCardProps {
  bestMonth: {
    month: string;
    monthLabel: string;
    savings: number;
    savingsRate: number;
  } | null;
  positiveStreak: number;
}

const FULL_MONTHS: Record<string, string> = {
  Ene: 'Enero',
  Feb: 'Febrero',
  Mar: 'Marzo',
  Abr: 'Abril',
  May: 'Mayo',
  Jun: 'Junio',
  Jul: 'Julio',
  Ago: 'Agosto',
  Sep: 'Septiembre',
  Oct: 'Octubre',
  Nov: 'Noviembre',
  Dic: 'Diciembre',
};

export default function BestMonthCard({ bestMonth, positiveStreak }: BestMonthCardProps) {
  const { formatAmount } = usePrivacy();

  return (
    <Card>
      <CardHeader title="Tu mejor mes" subtitle="El mes que más ahorraste" />

      {bestMonth ? (
        <View>
          <View className="items-center py-3">
            <LinearGradient
              colors={['#facc15', '#f59e0b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 64, height: 64, borderRadius: 32 }}
              className="items-center justify-center mb-3"
            >
              <Trophy size={32} color="#ffffff" />
            </LinearGradient>

            <Text className="text-2xl font-bold text-foreground">
              {FULL_MONTHS[bestMonth.monthLabel] ?? bestMonth.monthLabel}
            </Text>
            <Text className="text-xs text-muted-foreground mt-1">Tu mes más ahorrador</Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-income/10 p-4 items-center">
              <Star size={20} color="#22c55e" />
              <Text className="text-base font-bold text-income mt-2" numberOfLines={1}>
                {formatAmount(bestMonth.savings)}
              </Text>
              <Text className="text-[11px] text-muted-foreground text-center mt-1">
                Ahorro logrado
              </Text>
            </View>

            <View className="flex-1 rounded-2xl bg-primary/10 p-4 items-center">
              <Trophy size={20} color="#6366f1" />
              <Text className="text-base font-bold text-primary mt-2">
                {Math.round(bestMonth.savingsRate)}%
              </Text>
              <Text className="text-[11px] text-muted-foreground text-center mt-1">
                Tasa de ahorro
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <EmptyState
          emoji="🏆"
          title="Aún no hay un mejor mes"
          description="Necesitas al menos un mes en positivo para ver esta tarjeta."
        />
      )}

      {positiveStreak > 0 && (
        <LinearGradient
          colors={['rgba(34,197,94,0.15)', 'rgba(99,102,241,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ borderRadius: 16 }}
          className="p-4 mt-4"
        >
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-2xl bg-income/20 items-center justify-center">
              <Flame size={22} color="#22c55e" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-income">
                🔥 Racha de {positiveStreak} {positiveStreak === 1 ? 'mes' : 'meses'}
              </Text>
              <Text className="text-xs text-muted-foreground">
                Consecutivos en positivo. ¡Sigue así!
              </Text>
            </View>
          </View>
        </LinearGradient>
      )}
    </Card>
  );
}
