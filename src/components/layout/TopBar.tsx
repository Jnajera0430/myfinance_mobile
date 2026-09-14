import { View, Text, TouchableOpacity } from 'react-native';
import { User, Bell } from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';

export default function TopBar() {
  const { user } = useAuth();
  const name = user?.name?.split(' ')[0] || 'Usuario';

  return (
    <View className="flex-row justify-between items-center px-4 py-3 bg-background border-b border-border">
      <View>
        <Text className="text-xs text-muted-foreground">Bienvenido,</Text>
        <Text className="text-lg font-bold text-foreground">{name} 👋</Text>
      </View>
      <View className="flex-row space-x-3">
        <TouchableOpacity>
          <Bell size={20} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity>
          <User size={20} color="#6b7280" />
        </TouchableOpacity>
      </View>
    </View>
  );
}