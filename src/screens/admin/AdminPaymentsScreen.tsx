import { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { KeyRound, Copy } from 'lucide-react-native';
import { usePayments } from '../../contexts/PaymentContext';
import { Badge } from '../../components/ui/Badge';
import { Card, EmptyState } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { toast } from '../../hooks/use-toast';
import { formatAmount, formatDateTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Payment, PaymentStatus } from '../../types/payments';

const FILTERS: { value: 'ALL' | PaymentStatus; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'PENDING', label: 'Pendientes' },
  { value: 'COMPLETED', label: 'Aprobados' },
  { value: 'REJECTED', label: 'Rechazados' },
  { value: 'EXPIRED', label: 'Expirados' },
];

const STATUS_BADGE: Record<PaymentStatus, { label: string; variant: 'income' | 'warning' | 'expenseFixed' | 'muted' }> = {
  PENDING: { label: 'Pendiente', variant: 'warning' },
  COMPLETED: { label: 'Aprobado', variant: 'income' },
  REJECTED: { label: 'Rechazado', variant: 'expenseFixed' },
  FAILED: { label: 'Fallido', variant: 'expenseFixed' },
  REFUNDED: { label: 'Reembolsado', variant: 'muted' },
  EXPIRED: { label: 'Expirado', variant: 'muted' },
};

export default function AdminPaymentsScreen() {
  const { payments, tokens, loading, error, updatePaymentStatus, generateToken } = usePayments();
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pending, setPending] = useState<Payment | null>(null);
  const [pendingStatus, setPendingStatus] = useState<PaymentStatus>('COMPLETED');
  const [note, setNote] = useState('');
  const [noteVisible, setNoteVisible] = useState(false);

  const filtered = useMemo(
    () => (filter === 'ALL' ? payments : payments.filter((item) => item.paymentStatus === filter)),
    [filter, payments],
  );

  const pendingCount = payments.filter((item) => item.paymentStatus === 'PENDING').length;

  const askObservation = (payment: Payment, status: PaymentStatus) => {
    setPending(payment);
    setPendingStatus(status);
    setNote(payment.observation ?? '');
    setNoteVisible(true);
  };

  const confirmNote = async () => {
    if (!pending) return;
    setNoteVisible(false);
    setBusyId(pending.id);
    try {
      await updatePaymentStatus(pending.id, pendingStatus, note.trim() || undefined);
      toast({
        title: pendingStatus === 'COMPLETED' ? 'Pago aprobado' : 'Pago rechazado',
        variant: pendingStatus === 'COMPLETED' ? 'success' : 'destructive',
      });
    } catch {
      toast({ title: 'No se pudo actualizar el pago', variant: 'destructive' });
    } finally {
      setBusyId(null);
      setPending(null);
    }
  };

  const handleGenerateToken = (payment: Payment) => {
    Alert.alert(
      'Generar acceso',
      `Se firmará un token para ${payment.user?.email ?? 'este cliente'} y se enviará por correo.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            if (!payment.user?.id || !payment.service?.id) {
              toast({ title: 'Faltan datos del pago', variant: 'destructive' });
              return;
            }
            setBusyId(payment.id);
            try {
              await generateToken({
                userId: payment.user.id,
                serviceId: payment.service.id,
                paymentId: payment.id,
              });
              toast({ title: 'Token generado', description: 'El cliente recibió el correo.', variant: 'success' });
            } catch (tokenError) {
              toast({
                title: 'No se pudo generar el token',
                description:
                  tokenError instanceof Error ? tokenError.message : 'Revisa que el pago esté aprobado.',
                variant: 'destructive',
              });
            } finally {
              setBusyId(null);
            }
          },
        },
      ],
    );
  };

  const copyToken = async (value: string) => {
    try {
      await Clipboard.setStringAsync(value);
      toast({ title: 'Token copiado' });
    } catch {
      toast({ title: 'No se pudo copiar el token', variant: 'destructive' });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-xl font-bold text-foreground">Pagos</Text>
        <Text className="text-xs text-muted-foreground mb-4">
          {pendingCount > 0
            ? `${pendingCount} pago(s) esperando revisión`
            : 'No hay pagos pendientes de revisión.'}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2">
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item.value}
                onPress={() => setFilter(item.value)}
                className={cn(
                  'rounded-full px-3.5 py-2 border',
                  filter === item.value ? 'bg-primary border-primary' : 'bg-white border-border',
                )}
              >
                <Text
                  className={cn(
                    'text-xs font-semibold',
                    filter === item.value ? 'text-white' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {error && (
          <View className="rounded-2xl bg-destructive/10 border border-destructive/25 p-4 mb-4">
            <Text className="text-sm text-destructive">
              No se pudieron cargar los pagos. Esta sección requiere rol admin.
            </Text>
          </View>
        )}

        {loading && payments.length === 0 ? (
          <View className="items-center py-12">
            <ActivityIndicator color="#6366f1" />
          </View>
        ) : filtered.length === 0 ? (
          <Card>
            <EmptyState emoji="💳" title="Sin pagos en este filtro" description="Cambia el filtro o registra un pago manual." />
          </Card>
        ) : (
          filtered.map((payment) => {
            const status = STATUS_BADGE[payment.paymentStatus] ?? STATUS_BADGE.PENDING;
            const token = payment.token ?? tokens.find((item) => item.payment?.id === payment.id);

            return (
              <Card key={payment.id} className="mb-3">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <Text className="text-sm font-bold text-foreground" numberOfLines={1}>
                      {payment.service?.name ?? 'Servicio'}
                    </Text>
                    <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={1}>
                      {payment.user?.name ?? 'Cliente'} · {payment.user?.email}
                    </Text>
                    <Text className="text-[10px] text-muted-foreground mt-1">
                      {formatDateTime(payment.createdAt)}
                    </Text>
                  </View>

                  <View className="items-end">
                    <Text className="text-base font-bold text-foreground" numberOfLines={1}>
                      {formatAmount(payment.amount)}
                    </Text>
                    <View className="mt-1">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </View>
                  </View>
                </View>

                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-border">
                  <Text className="text-[10px] text-muted-foreground flex-1 mr-2" numberOfLines={1}>
                    {payment.paymentMethod.replace(/_/g, ' ').toLowerCase()} ·{' '}
                    {payment.externalReference || 'sin referencia'}
                  </Text>

                  {!!payment.observation && (
                    <Text className="text-[10px] text-muted-foreground max-w-[45%]" numberOfLines={1}>
                      {payment.observation}
                    </Text>
                  )}
                </View>

                {payment.paymentStatus === 'PENDING' && (
                  <View className="flex-row gap-2 mt-3">
                    <View className="flex-1">
                      <Button
                        label="Aprobar"
                        size="sm"
                        variant="success"
                        loading={busyId === payment.id}
                        onPress={() => askObservation(payment, 'COMPLETED')}
                      />
                    </View>
                    <View className="flex-1">
                      <Button
                        label="Rechazar"
                        size="sm"
                        variant="danger"
                        onPress={() => askObservation(payment, 'REJECTED')}
                      />
                    </View>
                  </View>
                )}

                {payment.paymentStatus === 'COMPLETED' && !payment.generatedToken && (
                  <View className="mt-3">
                    <Button
                      label="Generar acceso"
                      size="sm"
                      variant="secondary"
                      loading={busyId === payment.id}
                      icon={<KeyRound size={15} color="#312e81" />}
                      onPress={() => handleGenerateToken(payment)}
                    />
                  </View>
                )}

                {!!token && (
                  <View className="mt-3 rounded-2xl bg-muted p-3">
                    <Text className="text-[10px] font-bold text-muted-foreground mb-1">
                      TOKEN DE ACCESO
                    </Text>
                    <View className="flex-row items-center">
                      <Text className="text-xs font-mono text-foreground flex-1" numberOfLines={1}>
                        {token.token}
                      </Text>
                      <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => void copyToken(token.token)}
                        className="p-1.5"
                      >
                        <Copy size={14} color="#6366f1" />
                      </TouchableOpacity>
                    </View>
                    <Text className="text-[10px] text-muted-foreground mt-1">
                      Expira: {formatDateTime(token.expiresAt)}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })
        )}
      </ScrollView>

      {/* Modal de nota para aprobar/rechazar */}
      {noteVisible && (
        <View className="absolute inset-0 bg-black/50 justify-end">
          <View className="bg-card rounded-t-3xl p-5">
            <Text className="text-lg font-bold text-foreground mb-1">
              {pendingStatus === 'COMPLETED' ? 'Aprobar pago' : 'Rechazar pago'}
            </Text>
            <Text className="text-xs text-muted-foreground mb-4">
              {pending?.user?.email} · {pending?.service?.name}
            </Text>

            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Nota para el cliente (opcional)"
              placeholderTextColor="#94a3b8"
              multiline
              textAlignVertical="top"
              className="rounded-2xl border border-border bg-white px-4 py-3 text-base text-foreground h-24 mb-4"
            />

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setNoteVisible(false)}
                className="flex-1 rounded-2xl border border-border py-3.5 items-center"
              >
                <Text className="text-foreground font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <View className="flex-1">
                <Button label="Confirmar" onPress={confirmNote} />
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}
