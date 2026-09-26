import { View, Text, TouchableOpacity } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';
import type { Transaction } from '../../graphql/types';
import { getCategoryColor, getCategoryIcon, getCategoryLabel } from '../../lib/categories';
import { formatShortDate } from '../../lib/format';
import { useSettings } from '../../contexts/SettingsContext';
import { usePrivacy } from '../../contexts/PrivacyContext';
import { cn } from '../../lib/utils';

const TYPE_BADGE: Record<Transaction['type'], { label: string; color: string }> = {
  INCOME: { label: 'Ingreso', color: '#22c55e' },
  FIXED_EXPENSE: { label: 'Fijo', color: '#ef4444' },
  VARIABLE_EXPENSE: { label: 'Variable', color: '#f59e0b' },
};

interface TransactionItemProps {
  transaction: Transaction;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  compact?: boolean;
}

export default function TransactionItem({
  transaction,
  onEdit,
  onDelete,
  compact = false,
}: TransactionItemProps) {
  const { language } = useSettings();
  const { formatAmount: formatPrivileged } = usePrivacy();

  const isIncome = transaction.type === 'INCOME';
  const color = getCategoryColor(transaction.category);
  const badge = TYPE_BADGE[transaction.type];

  return (
    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => onEdit?.(transaction)}
      className="flex-row items-center rounded-2xl border border-border bg-white p-3 mb-2"
    >
      <View
        style={{ backgroundColor: `${color}1F` }}
        className="w-10 h-10 rounded-2xl items-center justify-center mr-3"
      >
        <Text className="text-base">{getCategoryIcon(transaction.category)}</Text>
      </View>

      <View className="flex-1 min-w-0">
        <Text className="text-sm font-semibold text-foreground" numberOfLines={1}>
          {transaction.description || getCategoryLabel(transaction.category)}
        </Text>
        <View className="flex-row items-center gap-2 mt-0.5">
          <Text className="text-xs text-muted-foreground">{getCategoryLabel(transaction.category)}</Text>
          <Text className="text-xs text-muted-foreground">·</Text>
          <Text className="text-xs text-muted-foreground">
            {formatShortDate(transaction.date, language)}
          </Text>
          {transaction.isRecurring && !compact && (
            <Text className="text-xs text-primary">↻</Text>
          )}
          {!isIncome && !transaction.isPaid && (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: '#ef444422' }}>
              <Text className="text-[10px] font-semibold text-destructive">Pendiente</Text>
            </View>
          )}
        </View>
      </View>

      <View className="items-end ml-2">
        <Text
          className={cn('text-base font-bold', isIncome ? 'text-income' : 'text-foreground')}
          numberOfLines={1}
        >
          {isIncome ? '+' : '−'}
          {formatPrivileged(Number(transaction.amount))}
        </Text>
        {!compact && (
          <Text className="text-[10px] font-medium" style={{ color: badge.color }}>
            {badge.label}
          </Text>
        )}
      </View>

      {(onEdit || onDelete) && !compact && (
        <View className="flex-row ml-1">
          {!!onEdit && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Editar movimiento"
              onPress={() => onEdit(transaction)}
              className="p-2"
            >
              <Pencil size={16} color="#64748b" />
            </TouchableOpacity>
          )}
          {!!onDelete && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Eliminar movimiento"
              onPress={() => onDelete(transaction)}
              className="p-2"
            >
              <Trash2 size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}
