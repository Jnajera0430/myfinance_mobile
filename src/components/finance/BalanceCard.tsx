import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Wallet } from 'lucide-react-native';
import { usePrivacy } from '../../contexts/PrivacyContext';

export default function BalanceCard({ balance, subtitle }: { balance: number; subtitle?: string }) {
  const { formatAmount, isIncognito } = usePrivacy();
  const negative = balance < 0;

  return (
    <LinearGradient
      colors={negative ? ['#dc2626', '#991b1b'] : ['#6366f1', '#7c3aed']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24 }}
    >
      <View className="p-5">
        <View className="flex-row items-center justify-between">
          <Text className="text-white/80 text-sm">Balance disponible</Text>
          <View className="w-9 h-9 rounded-2xl bg-white/15 items-center justify-center">
            <Wallet size={18} color="#ffffff" />
          </View>
        </View>

        <Text className="text-white text-3xl font-bold mt-2" numberOfLines={1}>
          {formatAmount(balance)}
        </Text>

        <Text className="text-white/70 text-xs mt-2" numberOfLines={2}>
          {subtitle ??
            (negative
              ? 'Estás en números rojos: revisa tus gastos fijos.'
              : 'Ingresos registrados menos tus gastos.')}
        </Text>

        {isIncognito && (
          <Text className="text-white/60 text-xs mt-2">Modo privado activo · toca “Ocultar montos” en Ajustes</Text>
        )}
      </View>
    </LinearGradient>
  );
}
