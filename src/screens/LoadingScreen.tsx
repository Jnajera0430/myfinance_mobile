import { View, Text, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <View className="w-16 h-16 rounded-3xl bg-primary items-center justify-center mb-4">
        <Text className="text-white text-2xl font-bold">M</Text>
      </View>
      <Text className="text-lg font-semibold text-foreground">Mifinanzas</Text>
      <Text className="text-sm text-muted-foreground mt-1">Cargando tus finanzas…</Text>
      <ActivityIndicator className="mt-5" color="#6366f1" />
    </View>
  );
}
