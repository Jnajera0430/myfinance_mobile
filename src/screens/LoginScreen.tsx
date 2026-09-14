import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur'; // optional, for glass effect
import { DEMO_CREDENTIALS, useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');
    const success = await login(email, password);
    if (success) {
      navigation.navigate('Dashboard' as never); // replace with your dashboard route name
    } else {
      setError('Credenciales inválidas. Usa las credenciales de demo.');
    }
  };

  const fillDemoCredentials = (role: 'admin' | 'client') => {
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-background items-center justify-center p-4 relative">
          {/* Background blur effects */}
          <View className="absolute inset-0 overflow-hidden">
            <View className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <View className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
          </View>

          {/* Glass card */}
          <BlurView
            intensity={80}
            tint="light"
            className="w-full max-w-md rounded-2xl overflow-hidden p-6 shadow-lg"
          >
            <View className="items-center space-y-2">
              <LinearGradient
                colors={['#3b82f6', '#a855f7']} // from-primary to-accent
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-12 h-12 rounded-xl items-center justify-center mb-4"
              >
                <Sparkles size={24} color="white" />
              </LinearGradient>
              <Text className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Mifinanzas.co
              </Text>
              <Text className="text-muted-foreground text-center">
                Inicia sesión para acceder a tu panel de control
              </Text>
            </View>

            <View className="mt-6 space-y-4">
              {/* Email input */}
              <View className="space-y-2">
                <Text className="text-foreground text-sm font-medium">Email</Text>
                <TextInput
                  placeholder="tu@email.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground focus:border-primary"
                  placeholderTextColor="#9ca3af"
                />
              </View>

              {/* Password input */}
              <View className="space-y-2">
                <Text className="text-foreground text-sm font-medium">Contraseña</Text>
                <View className="relative">
                  <TextInput
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    className="bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-10 text-foreground focus:border-primary"
                    placeholderTextColor="#9ca3af"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff size={16} color="#6b7280" />
                    ) : (
                      <Eye size={16} color="#6b7280" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {error && (
                <Text className="text-destructive text-sm text-center">{error}</Text>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={isLoading}
                className="bg-gradient-to-r from-primary to-accent rounded-lg py-3 items-center"
              >
                {isLoading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="white" />
                    <Text className="ml-2 text-white font-medium">Iniciando sesión...</Text>
                  </View>
                ) : (
                  <Text className="text-white font-medium">Iniciar Sesión</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Demo credentials */}
            <View className="mt-6 pt-6 border-t border-border space-y-2">
              <Text className="text-sm text-muted-foreground text-center mb-3">
                Accesos de demostración
              </Text>
              <TouchableOpacity
                onPress={() => fillDemoCredentials('client')}
                className="border border-primary/50 rounded-lg py-2 items-center"
              >
                <Text className="text-primary font-medium">Demo Cliente</Text>
              </TouchableOpacity>
              {/* Uncomment if admin demo is needed */}
              {/* <TouchableOpacity
                onPress={() => fillDemoCredentials('admin')}
                className="border border-accent/50 rounded-lg py-2 items-center mt-2"
              >
                <Text className="text-accent font-medium">Demo Admin</Text>
              </TouchableOpacity> */}
              <Text className="text-xs text-muted-foreground text-center mt-1">
                Cliente: demo@saas.com / demo123
              </Text>
            </View>
          </BlurView>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#333',
  },
  
};

export default LoginScreen;