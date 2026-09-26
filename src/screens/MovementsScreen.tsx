import { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useFinance } from '../contexts/FinanceContext.graphql';
import { useSettings } from '../contexts/SettingsContext';
import TransactionList from '../components/finance/TransactionList';
import TransactionForm from '../components/finance/TransactionForm';
import { toast } from '../hooks/use-toast';
import type { Transaction, TransactionType } from '../graphql/types';
import { cn } from '../lib/utils';

type Segment = 'ALL' | TransactionType;

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Ingresos' },
  { value: 'FIXED_EXPENSE', label: 'Fijos' },
  { value: 'VARIABLE_EXPENSE', label: 'Variables' },
];

interface MovementsScreenProps {
  initialSegment?: Segment;
}

export default function MovementsScreen({ initialSegment = 'ALL' }: MovementsScreenProps) {
  const { transactions, isLoading, deleteTransaction, refetch } = useFinance();
  const { currency, language } = useSettings();

  const [segment, setSegment] = useState<Segment>(initialSegment);
  const [formVisible, setFormVisible] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [removing, setRemoving] = useState(false);

  const filtered = useMemo(() => {
    const list = segment === 'ALL' ? transactions : transactions.filter((item) => item.type === segment);
    return [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  }, [segment, transactions]);

  const pendingTotal = useMemo(
    () =>
      filtered
        .filter((item) => item.type !== 'INCOME' && !item.isPaid)
        .reduce((sum, item) => sum + Number(item.amount), 0),
    [filtered],
  );

  const openCreate = () => {
    setEditing(null);
    setFormVisible(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setFormVisible(true);
  };

  const confirmDelete = (transaction: Transaction) => {
    Alert.alert(
      'Eliminar movimiento',
      `¿Seguro que quieres eliminar "${transaction.description}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            try {
              await deleteTransaction(transaction.id);
              toast({ title: 'Movimiento eliminado', variant: 'default' });
            } catch {
              toast({
                title: 'No se pudo eliminar',
                description: 'Revisa tu conexión e inténtalo otra vez.',
                variant: 'destructive',
              });
            } finally {
              setRemoving(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-foreground">Movimientos</Text>
        <Text className="text-sm text-muted-foreground mt-0.5">
          Revisa, edita o elimina lo que has registrado.
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 110 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row gap-1 bg-muted rounded-2xl p-1 mb-4">
          {SEGMENTS.map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setSegment(item.value)}
              className={cn(
                'flex-1 rounded-xl py-2 items-center',
                segment === item.value ? 'bg-primary' : 'bg-transparent',
              )}
            >
              <Text
                className={cn(
                  'text-xs font-semibold',
                  segment === item.value ? 'text-white' : 'text-muted-foreground',
                )}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {pendingTotal > 0 && (
          <View className="flex-row items-center justify-between rounded-2xl bg-destructive/10 border border-destructive/20 px-4 py-3 mb-4">
            <Text className="text-sm text-destructive font-medium">Gastos aún no pagados</Text>
            <Text className="text-sm font-bold text-destructive">
              {pendingTotal.toLocaleString('es-CO')}
            </Text>
          </View>
        )}

        {isLoading && transactions.length === 0 ? (
          <View className="items-center py-16">
            <ActivityIndicator color="#6366f1" size="large" />
            <Text className="text-muted-foreground mt-3">Cargando movimientos…</Text>
          </View>
        ) : (
          <TransactionList
            transactions={filtered}
            onEdit={openEdit}
            onDelete={confirmDelete}
            onAdd={openCreate}
            onRefresh={() => refetch()}
            refreshing={removing}
            currency={currency}
            language={language}
            emptyTitle={segment === 'ALL' ? 'Aún no hay movimientos' : 'Nada en esta categoría'}
            emptyDescription="Toca el botón + para registrar tu primer movimiento."
          />
        )}
      </ScrollView>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Registrar movimiento"
        onPress={openCreate}
        className="absolute bottom-6 right-4 w-14 h-14 rounded-full bg-primary items-center justify-center"
        style={{
          shadowColor: '#6366f1',
          shadowOpacity: 0.35,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 6,
        }}
      >
        <Plus size={26} color="#ffffff" />
      </TouchableOpacity>

      <TransactionForm
        visible={formVisible}
        onClose={() => setFormVisible(false)}
        editing={editing}
        defaultType={segment === 'ALL' ? undefined : segment}
      />
    </SafeAreaView>
  );
}
