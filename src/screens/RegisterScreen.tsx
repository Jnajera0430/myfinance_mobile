// src/screens/RegisterScreen.tsx
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
import { Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

const RegisterScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { register, isLoading } = useAuth();
  const navigation = useNavigation();

  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const success = await register(email, password, name);
    if (success) {
      navigation.navigate('Dashboard' as never); // reemplaza con tu ruta principal
    } else {
      setError('No se pudo crear la cuenta. Intenta con otro email.');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <View className="flex-1 items-center justify-center p-4 relative">
            {/* Efectos de fondo (blur) */}
            <View className="absolute inset-0 overflow-hidden">
              <View className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <View className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
            </View>

            {/* Tarjeta tipo glass */}
            <BlurView
              intensity={80}
              tint="light"
              className="w-full max-w-md rounded-2xl overflow-hidden p-6 shadow-lg"
            >
              {/* Cabecera con ícono */}
              <View className="items-center space-y-2 mb-4">
                <LinearGradient
                  colors={['#3b82f6', '#a855f7']} // from-primary to-accent
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  className="w-12 h-12 rounded-xl items-center justify-center mb-4"
                >
                  <UserPlus size={24} color="white" />
                </LinearGradient>
                <Text className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Crear Cuenta
                </Text>
                <Text className="text-muted-foreground text-center">
                  Regístrate para comenzar a controlar tus finanzas
                </Text>
              </View>

              {/* Formulario */}
              <View className="space-y-4">
                {/* Campo Nombre */}
                <View className="space-y-2">
                  <Text className="text-foreground text-sm font-medium">Nombre</Text>
                  <TextInput
                    placeholder="Tu nombre"
                    value={name}
                    onChangeText={setName}
                    className="bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Campo Email */}
                <View className="space-y-2">
                  <Text className="text-foreground text-sm font-medium">Email</Text>
                  <TextInput
                    placeholder="tu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {/* Campo Contraseña */}
                <View className="space-y-2">
                  <Text className="text-foreground text-sm font-medium">Contraseña</Text>
                  <View className="relative">
                    <TextInput
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      className="bg-secondary/50 border border-border rounded-lg px-4 py-3 pr-10 text-foreground"
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

                {/* Campo Confirmar Contraseña */}
                <View className="space-y-2">
                  <Text className="text-foreground text-sm font-medium">
                    Confirmar Contraseña
                  </Text>
                  <TextInput
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    className="bg-secondary/50 border border-border rounded-lg px-4 py-3 text-foreground"
                    placeholderTextColor="#9ca3af"
                  />
                </View>

                {error && (
                  <Text className="text-destructive text-sm text-center">{error}</Text>
                )}

                {/* Botón de registro */}
                <TouchableOpacity onPress={handleSubmit} disabled={isLoading}>
                  <LinearGradient
                    colors={['#3b82f6', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-lg py-3 items-center"
                  >
                    {isLoading ? (
                      <View className="flex-row items-center justify-center">
                        <ActivityIndicator size="small" color="white" />
                        <Text className="ml-2 text-white font-medium">
                          Creando cuenta...
                        </Text>
                      </View>
                    ) : (
                      <Text className="text-white font-medium">Crear Cuenta</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Enlace a Login */}
              <View className="mt-6 pt-6 border-t border-border items-center">
                <Text className="text-sm text-muted-foreground">
                  ¿Ya tienes cuenta?{' '}
                  <Text
                    onPress={() => navigation.navigate('Login' as never)}
                    className="text-primary font-medium"
                  >
                    Iniciar Sesión
                  </Text>
                </Text>
              </View>
            </BlurView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default RegisterScreen;