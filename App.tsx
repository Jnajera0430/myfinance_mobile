import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client/react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { apolloClient } from './src/lib/apollo-client';
import { AuthProvider } from './src/contexts/AuthContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { PrivacyProvider } from './src/contexts/PrivacyContext';
import { FinanceProvider } from './src/contexts/FinanceContext';
import { PaymentProvider } from './src/contexts/PaymentContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Toaster } from './src/components/ui/toast';

export default function App() {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <SettingsProvider>
            <PrivacyProvider>
              <FinanceProvider>
                <PaymentProvider>
                  <StatusBar style="dark" />
                  <AppNavigator />
                  <Toaster />
                </PaymentProvider>
              </FinanceProvider>
            </PrivacyProvider>
          </SettingsProvider>
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
}
