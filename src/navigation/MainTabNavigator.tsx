import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MovementsScreen from '../screens/MovementsScreen';

export type MainTabParamList = {
  Dashboard: undefined;
  Movements: undefined;
  Reports: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const ICONS: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Dashboard: 'home',
  Movements: 'swap-vertical',
  Reports: 'bar-chart',
  Settings: 'settings',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={ICONS[route.name]}
            size={focused ? size + 2 : size}
            color={color}
          />
        ),
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e2e8f0',
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen
        name="Movements"
        component={MovementsScreen}
        options={{ tabBarLabel: 'Movimientos' }}
      />
      <Tab.Screen name="Reports" component={ReportsScreen} options={{ tabBarLabel: 'Reportes' }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: 'Ajustes' }} />
    </Tab.Navigator>
  );
}
