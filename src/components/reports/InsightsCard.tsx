import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function InsightsCard({ insights }: { insights: string[] }) {
  if (!insights || insights.length === 0) return null;

  return (
    <LinearGradient
      colors={['#eef2ff', '#faf5ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ borderRadius: 24, overflow: 'hidden' }}
    >
      <View className="p-5">
        <Text className="text-base font-bold text-foreground mb-3">💡 Lo que tus datos dicen</Text>

        {insights.slice(0, 4).map((insight, index) => (
          <View key={`${index}-${insight.slice(0, 12)}`} className="flex-row mb-2">
            <Text className="text-primary font-bold mr-2">•</Text>
            <Text className="text-sm text-foreground flex-1">{insight}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
}

