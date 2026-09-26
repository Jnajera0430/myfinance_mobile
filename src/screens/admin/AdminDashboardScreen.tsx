import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Pencil, Trash2, Crown, Check } from 'lucide-react-native';
import { usePayments } from '../../contexts/PaymentContext';
import { useSettings } from '../../contexts/SettingsContext';
import { Badge } from '../../components/ui/Badge';
import { Card, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Input';
import { toast } from '../../hooks/use-toast';
import { formatAmount, getCurrencyInfo } from '../../lib/format';
import { parseAmount } from '../../lib/utils';
import type { PaymentCurrency, Service } from '../../types/payments';

interface ServiceDraft {
  id?: string;
  name: string;
  description: string;
  price: string;
  durationDays: string;
  features: string;
  highlighted: boolean;
  paymentCurrency: PaymentCurrency;
}

const emptyDraft = (): ServiceDraft => ({
  name: '',
  description: '',
  price: '',
  durationDays: '30',
  features: '',
  highlighted: false,
  paymentCurrency: 'COP',
});

const toDraft = (service: Service): ServiceDraft => ({
  id: service.id,
  name: service.name,
  description: service.description,
  price: String(service.price),
  durationDays: String(service.durationDays),
  features: service.features.join('\n'),
  highlighted: !!service.highlighted,
  paymentCurrency: service.paymentCurrency ?? 'COP',
});

export default function AdminDashboardScreen() {
  const { services, loading, error, addService, updateService, deleteService } = usePayments();
  const { currency: displayCurrency } = useSettings();

  const [formVisible, setFormVisible] = useState(false);
  const [draft, setDraft] = useState<ServiceDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const ordered = useMemo(
    () => [...services].sort((a, b) => Number(!!b.highlighted) - Number(!!a.highlighted) || a.price - b.price),
    [services],
  );

  const openCreate = () => {
    setDraft(emptyDraft());
    setFormError('');
    setFormVisible(true);
  };

  const openEdit = (service: Service) => {
    setDraft(toDraft(service));
    setFormError('');
    setFormVisible(true);
  };

  const handleSave = async () => {
    const price = parseAmount(draft.price);
    const durationDays = parseAmount(draft.durationDays);
    const features = draft.features
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (draft.name.trim().length < 2) return setFormError('El nombre es obligatorio.');
    if (draft.description.trim().length < 5) return setFormError('Describe el plan (mínimo 5 caracteres).');
    if (price <= 0) return setFormError('El precio debe ser mayor que 0.');
    if (durationDays < 1) return setFormError('La duración debe ser de al menos 1 día.');
    if (features.length === 0) return setFormError('Añade al menos un beneficio.');

    setSaving(true);
    try {
      const payload = {
        name: draft.name.trim(),
        description: draft.description.trim(),
        price,
        durationDays: Math.round(durationDays),
        features,
        highlighted: draft.highlighted,
        paymentCurrency: draft.paymentCurrency,
      };

      if (draft.id) {
        await updateService(draft.id, payload);
        toast({ title: 'Plan actualizado', variant: 'success' });
      } else {
        await addService(payload);
        toast({ title: 'Plan creado', description: payload.name, variant: 'success' });
      }

      setFormVisible(false);
    } catch (saveError) {
      setFormError('No se pudo guardar. Verifica que tu cuenta sea admin.');
      if (__DEV__) console.error('save service', saveError);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (service: Service) => {
    Alert.alert(
      'Desactivar plan',
      `¿Desactivar "${service.name}"? Los clientes actuales no se ven afectados.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desactivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteService(service.id);
              toast({ title: 'Plan desactivado' });
            } catch {
              toast({ title: 'No se pudo desactivar', variant: 'destructive' });
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xl font-bold text-foreground">Planes y precios</Text>
          <TouchableOpacity
            accessibilityRole="button"
            onPress={openCreate}
            className="flex-row items-center gap-1 rounded-full bg-primary px-3 py-2"
          >
            <Plus size={16} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Nuevo</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs text-muted-foreground mb-4">
          Los planes activos se muestran en el checkout público.
        </Text>

        {error && (
          <View className="rounded-2xl bg-destructive/10 border border-destructive/25 p-4 mb-4">
            <Text className="text-sm text-destructive">
              No se pudieron cargar los planes. ¿Tu sesión es de administrador?
            </Text>
          </View>
        )}

        {loading && services.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#6366f1" />
          </View>
        ) : services.length === 0 ? (
          <Card>
            <EmptyState
              emoji="📦"
              title="No hay planes activos"
              description="Crea el primer plan para poder cobrar suscripciones."
              action={
                <View className="rounded-2xl bg-primary px-5 py-3">
                  <Text className="text-white font-semibold">Crear plan</Text>
                </View>
              }
            />
          </Card>
        ) : (
          ordered.map((service) => (
            <Card key={service.id} className="mb-3">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center gap-2">
                    <Text className="text-base font-bold text-foreground">{service.name}</Text>
                    {!!service.highlighted && (
                      <View className="flex-row items-center rounded-full bg-expense-variable/15 px-2 py-0.5">
                        <Crown size={10} color="#f59e0b" />
                        <Text className="text-[10px] font-bold text-expense-variable">PRO</Text>
                      </View>
                    )}
                  </View>
                  <Text className="text-xs text-muted-foreground mt-1">{service.description}</Text>
                </View>

                <View className="items-end">
                  <Text className="text-base font-bold text-primary" numberOfLines={1}>
                    {formatAmount(
                      service.price,
                      service.paymentCurrency ?? displayCurrency,
                      'es',
                    )}
                  </Text>
                  <Text className="text-[10px] text-muted-foreground">
                    / {service.durationDays} días
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-1.5 mt-3">
                {service.features.slice(0, 4).map((feature) => (
                  <View key={feature} className="rounded-full bg-muted px-2 py-1 flex-row items-center">
                    <Check size={9} color="#6366f1" />
                    <Text className="text-[10px] text-foreground ml-1">{feature}</Text>
                  </View>
                ))}
              </View>

              <View className="flex-row justify-end gap-2 mt-3 pt-3 border-t border-border">
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => openEdit(service)}
                  className="flex-row items-center rounded-xl border border-border px-3 py-2"
                >
                  <Pencil size={14} color="#64748b" />
                  <Text className="text-xs text-foreground ml-1 font-semibold">Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => confirmDelete(service)}
                  className="flex-row items-center rounded-xl border border-destructive/30 px-3 py-2"
                >
                  <Trash2 size={14} color="#ef4444" />
                  <Text className="text-xs text-destructive ml-1 font-semibold">Desactivar</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <View className="flex-row items-center justify-between mt-2">
          <Badge variant="muted">{`${services.length} plan(es) activos`}</Badge>
          <Text className="text-[10px] text-muted-foreground">
            Moneda de visualización: {getCurrencyInfo(displayCurrency).code}
          </Text>
        </View>
      </ScrollView>

      <Modal visible={formVisible} animationType="slide" transparent onRequestClose={() => setFormVisible(false)}>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl">
            <ScrollView
              contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
              keyboardShouldPersistTaps="handled"
            >
              <Text className="text-xl font-bold text-foreground mb-4">
                {draft.id ? 'Editar plan' : 'Nuevo plan'}
              </Text>

              <Text className="text-sm font-medium text-foreground mb-1.5">Nombre</Text>
              <TextInput
                value={draft.name}
                onChangeText={(value) => setDraft((prev) => ({ ...prev, name: value }))}
                placeholder="Pro"
                placeholderTextColor="#94a3b8"
                className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-3"
              />

              <Text className="text-sm font-medium text-foreground mb-1.5">Descripción</Text>
              <TextInput
                value={draft.description}
                onChangeText={(value) => setDraft((prev) => ({ ...prev, description: value }))}
                placeholder="Para quienes quieren control total"
                placeholderTextColor="#94a3b8"
                multiline
                className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-3 h-20"
              />

              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-1.5">Precio</Text>
                  <TextInput
                    value={draft.price}
                    onChangeText={(value) => setDraft((prev) => ({ ...prev, price: value }))}
                    placeholder="59900"
                    keyboardType="numeric"
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-3"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground mb-1.5">Días</Text>
                  <TextInput
                    value={draft.durationDays}
                    onChangeText={(value) => setDraft((prev) => ({ ...prev, durationDays: value }))}
                    placeholder="30"
                    keyboardType="numeric"
                    placeholderTextColor="#94a3b8"
                    className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-3"
                  />
                </View>
              </View>

              <View className="mb-3">
                <Select
                  label="Moneda de cobro"
                  value={draft.paymentCurrency}
                  options={[
                    { value: 'COP', label: 'COP · Peso colombiano' },
                    { value: 'USD', label: 'USD · Dólar' },
                  ]}
                  onChange={(value) =>
                    setDraft((prev) => ({ ...prev, paymentCurrency: value as PaymentCurrency }))
                  }
                />
              </View>

              <Text className="text-sm font-medium text-foreground mb-1.5">
                Beneficios (uno por línea)
              </Text>
              <TextInput
                value={draft.features}
                onChangeText={(value) => setDraft((prev) => ({ ...prev, features: value }))}
                placeholder={'Transacciones ilimitadas\nEscaneo de tickets'}
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground mb-3 h-28"
              />

              <View className="flex-row items-center justify-between rounded-2xl border border-border bg-white px-4 py-3 mb-4">
                <View className="flex-1 mr-3">
                  <Text className="text-base text-foreground">Destacar plan</Text>
                  <Text className="text-xs text-muted-foreground">Aparece primero en el checkout</Text>
                </View>
                <Switch
                  value={draft.highlighted}
                  onValueChange={(value) => setDraft((prev) => ({ ...prev, highlighted: value }))}
                  trackColor={{ true: '#6366f1' }}
                />
              </View>

              {!!formError && (
                <View className="rounded-2xl bg-destructive/10 border border-destructive/25 px-4 py-3 mb-4">
                  <Text className="text-sm text-destructive">{formError}</Text>
                </View>
              )}

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setFormVisible(false)}
                  disabled={saving}
                  className="flex-1 rounded-2xl border border-border py-3.5 items-center"
                >
                  <Text className="text-foreground font-semibold">Cancelar</Text>
                </TouchableOpacity>
                <View className="flex-1">
                  <Button
                    label={draft.id ? 'Guardar cambios' : 'Crear plan'}
                    onPress={handleSave}
                    loading={saving}
                  />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
