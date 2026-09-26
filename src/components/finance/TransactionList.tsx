import { View, Text, FlatList, RefreshControl } from 'react-native';
import type { Transaction } from '../../graphql/types';
import TransactionItem from './TransactionItem';
import { EmptyState } from '../ui/Card';
import { formatAmount } from '../../lib/format';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onAdd?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  refreshing?: boolean;
  onRefresh?: () => void;
  currency?: string;
  language?: 'es' | 'en';
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  onAdd,
  emptyTitle = 'Sin movimientos todavía',
  emptyDescription = 'Registra tu primer movimiento para ver el resumen.',
  refreshing,
  onRefresh,
  currency,
  language,
}: TransactionListProps) {
  const total = transactions.reduce((sum, item) => sum + Number(item.amount), 0);

  if (transactions.length === 0) {
    return (
      <View className="rounded-3xl border border-border bg-card">
        <EmptyState
          emoji="🧾"
          title={emptyTitle}
          description={emptyDescription}
          action={
            onAdd ? (
              <View className="rounded-2xl bg-primary py-3 px-6 items-center">
                <Text className="text-white font-semibold">+ Nuevo movimiento</Text>
              </View>
            ) : undefined
          }
        />
      </View>
    );
  }

  return (
    <View>
      <View className="flex-row items-center justify-between rounded-3xl bg-card border border-border px-4 py-3 mb-3">
        <Text className="text-sm text-muted-foreground">
          {transactions.length} {transactions.length === 1 ? 'movimiento' : 'movimientos'}
        </Text>
        <Text className="text-base font-bold text-foreground">
          {currency ? formatAmount(total, currency, language) : `$${total.toLocaleString('es-CO')}`}
        </Text>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TransactionItem transaction={item} onEdit={onEdit} onDelete={onDelete} />
        )}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          ) : undefined
        }
      />
    </View>
  );
}
