import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminPaymentsScreen from '../screens/admin/AdminPaymentsScreen';

export type AdminStackParamList = {
  AdminHome: undefined;
  AdminPayments: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitleStyle: { fontWeight: '700', color: '#0f172a' },
        headerStyle: { backgroundColor: '#f8fafc' },
      }}
    >
      <Stack.Screen name="AdminHome" component={AdminDashboardScreen} options={{ title: 'Planes' }} />
      <Stack.Screen
        name="AdminPayments"
        component={AdminPaymentsScreen}
        options={{ title: 'Pagos' }}
      />
    </Stack.Navigator>
  );
}
