import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import AdminNavigator from './AdminNavigator';
import LoadingScreen from '../screens/LoadingScreen';

export type RootStackParamList = {
  Auth: undefined;
  Tabs: undefined;
  Admin: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, isAdmin } = useAuth();

  if (isLoading) return <LoadingScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#f8fafc' },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Tabs" component={MainTabNavigator} />
            {isAdmin && (
              <Stack.Screen
                name="Admin"
                component={AdminNavigator}
                options={{ headerShown: true, title: 'Panel de administración' }}
              />
            )}
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
