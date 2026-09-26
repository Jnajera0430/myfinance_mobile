import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DEMO_CREDENTIALS, useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { Button } from '../components/ui/Button';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');

    if (!email.trim() || !password) {
      setError('Escribe tu correo y tu contraseña.');
      return;
    }

    setSubmitting(true);
    const success = await login(email, password);
    setSubmitting(false);

    if (!success) {
      setError('No pudimos iniciar sesión. Revisa tu correo y contraseña.');
    }
    // El AppNavigator cambia a la app principal al detectar la sesion.
  };

  const fillDemo = (role: 'admin' | 'client') => {
    setEmail(DEMO_CREDENTIALS[role].email);
    setPassword(DEMO_CREDENTIALS[role].password);
    setError('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 bg-background"
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md self-center bg-card rounded-3xl border border-border p-6">
            <LinearGradient
              colors={['#6366f1', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 48, height: 48, borderRadius: 16 }}
              className="items-center justify-center mb-4"
            >
              <Sparkles size={24} color="#ffffff" />
            </LinearGradient>

            <Text className="text-2xl font-bold text-foreground">Mifinanzas</Text>
            <Text className="text-muted-foreground text-sm mt-1 mb-6">
              Entra para revisar tu balance, gastos y reportes.
            </Text>

            <Text className="text-sm font-medium text-foreground mb-1.5">Correo</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              placeholderTextColor="#94a3b8"
              className="bg-white border border-border rounded-2xl px-4 py-3 text-base text-foreground mb-4"
            />

            <Text className="text-sm font-medium text-foreground mb-1.5">Contraseña</Text>
            <View className="relative">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                placeholderTextColor="#94a3b8"
                className="bg-white border border-border rounded-2xl px-4 py-3 pr-12 text-base text-foreground"
              />
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-0 h-full justify-center p-2"
              >
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>

            {!!error && (
              <View className="bg-destructive/10 border border-destructive/25 rounded-2xl px-4 py-3 mt-4">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            )}

            <View className="mt-6">
              {submitting ? (
                <View className="flex-row items-center justify-center rounded-2xl bg-primary py-3.5">
                  <ActivityIndicator color="#ffffff" />
                  <Text className="ml-2 text-white font-semibold">Entrando…</Text>
                </View>
              ) : (
                <Button label="Iniciar sesión" onPress={handleSubmit} />
              )}
            </View>

            <View className="mt-6 pt-5 border-t border-border">
              <Text className="text-xs text-muted-foreground text-center mb-3">
                Cuentas de prueba (backend local + npm run seed)
              </Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => fillDemo('client')}
                  className="flex-1 border border-primary/40 rounded-2xl py-2.5 items-center"
                >
                  <Text className="text-primary text-sm font-semibold">Cliente demo</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => fillDemo('admin')}
                  className="flex-1 border border-border rounded-2xl py-2.5 items-center"
                >
                  <Text className="text-muted-foreground text-sm font-semibold">Admin demo</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              className="mt-6 items-center"
            >
              <Text className="text-sm text-muted-foreground">
                ¿No tienes cuenta? <Text className="text-primary font-semibold">Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
