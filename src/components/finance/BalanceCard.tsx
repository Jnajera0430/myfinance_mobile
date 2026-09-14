// BalanceCard.tsx
import { View, Text } from 'react-native';

export default function BalanceCard({ balance }: { balance: number }) {
  return (
    <View className="bg-primary rounded-2xl p-5 shadow-md">
      <Text className="text-white/80 text-sm">Saldo total</Text>
      <Text className="text-white text-3xl font-bold mt-1">
        ${balance?.toLocaleString() ?? 0}
      </Text>
    </View>
  );
}