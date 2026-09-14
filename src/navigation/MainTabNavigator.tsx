// src/navigation/MainTabNavigator.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import ReportsScreen from '../screens/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import IncomeScreen from '../screens/IncomeScreen';
import FixedExpensesScreen from '../screens/FixedExpensesScreen';
import VariableExpensesScreen from '../screens/VariableExpensesScreen';

const Tab = createBottomTabNavigator();

// Mapeo de rutas web → tabs nativos:
// /dashboard     → Tab "Inicio"
// /income        → Tab "Ingresos"
// /fixed-expenses + /variable-expenses → Tab "Gastos"
// /reports       → Tab "Reportes"
// /settings      → Tab "Ajustes"

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: 'home',
            Income: 'trending-up',
            Expenses: 'cart',
            Reports: 'bar-chart',
            Settings: 'settings',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Income" component={IncomeScreen} />
      <Tab.Screen name="Expenses" component={FixedExpensesScreen} />
      <Tab.Screen name="VariableExpenses" component={VariableExpensesScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}