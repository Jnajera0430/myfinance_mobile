import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Scan } from 'lucide-react-native';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { usePaymentReminders } from '../../hooks/usePaymentReminders';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

interface TopBarProps {
  greeting?: string;
  name?: string | null;
}

export default function TopBar({ greeting = 'Hola', name }: TopBarProps) {
  const { isIncognito, toggleIncognito } = usePrivacy();
  const { reminders } = usePaymentReminders();
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();

  const firstName = name?.trim().split(' ')[0] ?? '';
  const dueSoon = reminders.filter((item) => item.daysUntilDue <= 1).length;

  return (
    <View className="flex-row items-center justify-between px-4 pt-3 pb-4">
      <View className="flex-1">
        <Text className="text-xs text-muted-foreground">{greeting}</Text>
        <Text className="text-xl font-bold text-foreground" numberOfLines={1}>
          {firstName ? `${firstName} 👋` : 'Tus finanzas'}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {dueSoon > 0 && (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${dueSoon} pagos por vencer`}
            onPress={() => navigation.navigate('Movements')}
            className="flex-row items-center rounded-full bg-destructive/10 px-3 py-1.5"
          >
            <Text className="text-xs font-bold text-destructive">⚠ {dueSoon}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          accessibilityRole="switch"
          accessibilityLabel={isIncognito ? 'Mostrar montos' : 'Ocultar montos'}
          onPress={toggleIncognito}
          className="w-10 h-10 rounded-2xl border border-border items-center justify-center"
        >
          {isIncognito ? <EyeOff size={18} color="#6366f1" /> : <Eye size={18} color="#64748b" />}
        </TouchableOpacity>

        <View className="w-10 h-10 rounded-2xl bg-primary/10 items-center justify-center">
          <Scan size={18} color="#6366f1" />
        </View>
      </View>
    </View>
  );
}
