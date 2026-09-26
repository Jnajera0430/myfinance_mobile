import { useEffect, useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, Alert, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import { LogOut, ShieldCheck, CreditCard, Eye, EyeOff } from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { usePrivacy } from '../contexts/PrivacyContext';
import { useFinance } from '../contexts/FinanceContext.graphql';
import { CURRENCIES, LANGUAGES } from '../lib/format';
import { Card, CardHeader } from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { GRAPHQL_URL } from '../lib/apollo-client';
import type { Currency, Language } from '../graphql/types';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';

export default function SettingsScreen() {
  const { user, isAdmin, logout } = useAuth();
  const {
    language,
    setLanguage,
    currency,
    setCurrency,
    darkMode,
    setDarkMode,
    exchangeRates,
    t,
  } = useSettings();
  const { isIncognito, toggleIncognito } = usePrivacy();
  const { payday, setPayday } = useFinance();
  const { setColorScheme } = useColorScheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [paydayDraft, setPaydayDraft] = useState(String(payday));
  const [savingPayday, setSavingPayday] = useState(false);

  useEffect(() => {
    setPaydayDraft(String(payday));
  }, [payday]);

  useEffect(() => {
    setColorScheme(darkMode ? 'dark' : 'light');
  }, [darkMode, setColorScheme]);

  const savePayday = async () => {
    const value = Number(paydayDraft);
    if (!Number.isInteger(value) || value < 1 || value > 31) {
      Alert.alert('Día inválido', 'Elige un día entre 1 y 31.');
      return;
    }
    setSavingPayday(true);
    try {
      await setPayday(value);
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    } finally {
      setSavingPayday(false);
    }
  };

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Quieres salir de tu cuenta en este dispositivo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => void logout() },
    ]);
  };

  const usd = exchangeRates.USD ?? 1;
  const rateToUsd = exchangeRates[currency];

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold text-foreground mb-1">{t('settings.title')}</Text>
        <Text className="text-sm text-muted-foreground mb-5">Tus preferencias y tu cuenta.</Text>

        <Card className="mb-4">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-2xl bg-primary items-center justify-center mr-3">
              <Text className="text-white text-lg font-bold">
                {(user?.name ?? '?').trim().charAt(0).toUpperCase()}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
                {user?.name ?? 'Sin nombre'}
              </Text>
              <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                {user?.email}
              </Text>
            </View>
            <View className="rounded-full bg-secondary px-2.5 py-1">
              <Text className="text-[10px] font-bold text-secondary-foreground">
                {isAdmin ? 'ADMIN' : 'CLIENTE'}
              </Text>
            </View>
          </View>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.preferences')} subtitle="Idioma y formato de dinero" />
          <View className="gap-4">
            <Select
              label={t('settings.language')}
              value={language}
              options={LANGUAGES.map((item) => ({ value: item.code, label: `${item.flag} ${item.name}` }))}
              onChange={(value) => void setLanguage(value as Language)}
            />
            <Select
              label={t('settings.currency')}
              value={currency}
              options={CURRENCIES.map((item) => ({
                value: item.code,
                label: `${item.code} · ${item.name}`,
              }))}
              onChange={(value) => void setCurrency(value as Currency)}
            />
            {rateToUsd ? (
              <Text className="text-xs text-muted-foreground">
                1 USD ≈ {rateToUsd.toLocaleString('es-CO', { maximumFractionDigits: 2 })} {currency}
              </Text>
            ) : (
              <Text className="text-xs text-muted-foreground">Tasa de USD a {currency} no disponible.</Text>
            )}
          </View>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.payday')} subtitle="Para calcular tu capacidad de gasto" />
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center flex-1 rounded-2xl border border-border bg-white px-4">
              <TextInputish value={paydayDraft} onChangeText={setPaydayDraft} />
            </View>
            <View className="w-36">
              <Button label="Guardar" size="sm" onPress={savePayday} loading={savingPayday} fullWidth />
            </View>
          </View>
          <Text className="text-xs text-muted-foreground mt-2">Día del mes en que recibes tu ingreso (1 a 31).</Text>
        </Card>

        <Card className="mb-4">
          <CardHeader title={t('settings.appearance')} />
          <View className="flex-row items-center justify-between py-2">
            <View className="flex-1 mr-3">
              <Text className="text-base text-foreground">{t('settings.darkMode')}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                Se guarda en tu cuenta y afecta la barra de estado.
              </Text>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => void setDarkMode(value)}
              trackColor={{ true: '#6366f1' }}
            />
          </View>
          <View className="flex-row items-center justify-between py-2 border-t border-border">
            <View className="flex-1 mr-3">
              <Text className="text-base text-foreground">{t('settings.hideAmounts')}</Text>
              <Text className="text-xs text-muted-foreground mt-0.5">
                Oculta tus saldos si miran tu pantalla.
              </Text>
            </View>
            <TouchableOpacity
              accessibilityRole="switch"
              accessibilityState={{ checked: isIncognito }}
              onPress={toggleIncognito}
              className="flex-row items-center gap-2"
            >
              {isIncognito ? (
                <EyeOff size={18} color="#6366f1" />
              ) : (
                <Eye size={18} color="#94a3b8" />
              )}
              <Switch value={isIncognito} onValueChange={toggleIncognito} trackColor={{ true: '#6366f1' }} />
            </TouchableOpacity>
          </View>
        </Card>

        {isAdmin && (
          <Card className="mb-4">
            <CardHeader
              title={t('settings.account')}
              subtitle="Gestión de planes, pagos y tokens"
              icon={<ShieldCheck size={18} color="#6366f1" />}
            />
            <Button
              label="Abrir panel de administración"
              variant="secondary"
              onPress={() => navigation.navigate('Admin')}
            />
          </Card>
        )}

        <Card className="mb-4">
          <CardHeader title="Conexión" icon={<CreditCard size={18} color="#64748b" />} />
          <Text className="text-xs text-muted-foreground" numberOfLines={2}>
            {GRAPHQL_URL}
          </Text>
        </Card>

        <Button label={t('settings.logout')} variant="danger" onPress={confirmLogout} icon={<LogOut size={18} color="#ffffff" />} />

        <TouchableOpacity onPress={() => Linking.openURL('https://mifinanzas.co')} className="mt-6 items-center">
          <Text className="text-xs text-muted-foreground">mifinanzas.co · versión 1.0.0</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// TextInput aislado para evitar que el teclado re-renderice toda la pantalla.
function TextInputish({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="number-pad"
      maxLength={2}
      className="flex-1 py-3 text-base text-foreground"
    />
  );
}
