import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { apolloClient } from './src/lib/apollo-client';
import { ApolloProvider } from '@apollo/client/react';

export default function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </AuthProvider>
    </ApolloProvider>
  );
}