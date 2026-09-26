import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
} from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { Button } from '../components/ui/Button';
import { cn } from '../lib/utils';

const MIN_PASSWORD_LENGTH = 8;

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigation = useNavigation<NavigationProp<AuthStackParamList>>();

  const checks = useMemo(
    () => [
      { label: 'Mínimo 8 caracteres', ok: password.length >= MIN_PASSWORD_LENGTH },
      { label: 'Al menos una letra', ok: /[A-Za-z]/.test(password) },
      { label: 'Al menos un número', ok: /[0-9]/.test(password) },
      { label: 'Las contraseñas coinciden', ok: password.length > 0 && password === confirmPassword },
    ],
    [password, confirmPassword],
  );

  const isValid = checks.every((check) => check.ok) && name.trim().length >= 2;

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');

    if (name.trim().length < 2) {
      setError('Escribe tu nombre.');
      return;
    }

    if (!isValid) {
      setError('Revisa los requisitos de la contraseña.');
      return;
    }

    setSubmitting(true);
    const success = await register(email, password, name);
    setSubmitting(false);

    if (!success) {
      setError('No pudimos crear la cuenta. Prueba con otro correo.');
    }
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
              <UserPlus size={24} color="#ffffff" />
            </LinearGradient>

            <Text className="text-2xl font-bold text-foreground">Crea tu cuenta</Text>
            <Text className="text-muted-foreground text-sm mt-1 mb-6">
              Empieza a controlar tus ingresos y gastos hoy.
            </Text>

            <Text className="text-sm font-medium text-foreground mb-1.5">Nombre</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Tu nombre"
              placeholderTextColor="#94a3b8"
              className="bg-white border border-border rounded-2xl px-4 py-3 text-base text-foreground mb-4"
            />

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
            <View className="relative mb-4">
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
                onPress={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-0 h-full justify-center p-2"
              >
                {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>

            <Text className="text-sm font-medium text-foreground mb-1.5">Confirmar contraseña</Text>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              placeholderTextColor="#94a3b8"
              className="bg-white border border-border rounded-2xl px-4 py-3 text-base text-foreground mb-4"
            />

            <View className="mb-4">
              {checks.map((check) => (
                <View key={check.label} className="flex-row items-center mb-1">
                  <Text className={cn('mr-2 text-xs', check.ok ? 'text-income' : 'text-muted-foreground')}>
                    {check.ok ? '✓' : '○'}
                  </Text>
                  <Text className={cn('text-xs', check.ok ? 'text-income' : 'text-muted-foreground')}>
                    {check.label}
                  </Text>
                </View>
              ))}
            </View>

            {!!error && (
              <View className="bg-destructive/10 border border-destructive/25 rounded-2xl px-4 py-3 mb-4">
                <Text className="text-destructive text-sm">{error}</Text>
              </View>
            )}

            {submitting ? (
              <View className="flex-row items-center justify-center rounded-2xl bg-primary py-3.5">
                <ActivityIndicator color="#ffffff" />
                <Text className="ml-2 text-white font-semibold">Creando cuenta…</Text>
              </View>
            ) : (
              <Button label="Crear cuenta" onPress={handleSubmit} disabled={!isValid} />
            )}

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              className="mt-6 items-center"
            >
              <Text className="text-sm text-muted-foreground">
                ¿Ya tienes cuenta? <Text className="text-primary font-semibold">Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
