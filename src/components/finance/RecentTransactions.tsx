// src/components/finance/RecentTransactions.tsx
import { Trash2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFinance, getCategoryLabel, Transaction } from '../../contexts/FinanceContext';
// import { useFinance as useFinanceLocal } from '../../contexts/FinanceContext';
// import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Alert, FlatList, TouchableOpacity, View, Text } from 'react-native';

const RecentTransactions = () => {
//   const { isDemo } = useAuth();
  const { transactions, deleteTransaction } = useFinance();
//   const { transactions: transactionsLocal, deleteTransaction: deleteTransactionLocal } = useFinanceLocal();

//   const recentTransactions = (isDemo ? transactionsLocal : transactions).slice(0, 8);
  const recentTransactions = (transactions).slice(0, 8);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    });
  };

  const getTypeColor = (type: Transaction['type']) => {
    switch (type) {
      case 'INCOME':
        return 'text-blue-400 bg-blue-500/10';
      case 'FIXED_EXPENSE':
        return 'text-red-400 bg-red-500/10';
      case 'VARIABLE_EXPENSE':
        return 'text-yellow-400 bg-yellow-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getAmountColor = (type: Transaction['type']) => {
    return type === 'INCOME' ? 'text-blue-400' : 'text-red-400';
  };

  const getAmountPrefix = (type: Transaction['type']) => {
    return type === 'INCOME' ? '+' : '-';
  };

  const getTypeEmoji = (type: Transaction['type']) => {
    switch (type) {
      case 'INCOME':
        return '🔵';
      case 'FIXED_EXPENSE':
        return '🔴';
      case 'VARIABLE_EXPENSE':
        return '🟡';
      default:
        return '⚪';
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            // if (isDemo) {
            //   deleteTransactionLocal(id);
            // } else {
              deleteTransaction(id);
            // }
          },
        },
      ]
    );
  };

  const renderTransactionItem = ({ item: transaction }: { item: Transaction }) => (
    <View className="flex-row items-center justify-between p-3 rounded-lg bg-muted/30 mb-2">
      <View className="flex-row items-center gap-3 flex-1 min-w-0">
        <View
          className={cn(
            'w-8 h-8 rounded-full items-center justify-center',
            getTypeColor(transaction.type).split(' ')[1] // extract bg class
          )}
        >
          <Text className="text-sm">{getTypeEmoji(transaction.type)}</Text>
        </View>

        <View className="flex-1">
          <Text className="font-medium text-foreground truncate">
            {transaction.description || getCategoryLabel(transaction.category)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {getCategoryLabel(transaction.category)} • {formatDate(transaction.date)}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2">
        <Text className={cn('font-semibold', getAmountColor(transaction.type))}>
          {getAmountPrefix(transaction.type)}
          {formatCurrency(transaction.amount)}
        </Text>

        <TouchableOpacity
          onPress={() => handleDelete(transaction.id)}
          activeOpacity={0.7}
          className="p-2 rounded-full"
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (recentTransactions.length === 0) {
    return (
      <LinearGradient
        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="bg-card rounded-2xl overflow-hidden border border-border"
      >
        <View className="p-5">
          <Text className="text-lg font-semibold text-foreground mb-2">
            Transacciones Recientes
          </Text>
          <View className="items-center py-8">
            <Text className="text-muted-foreground text-center">
              No hay transacciones aún.
            </Text>
            <Text className="text-sm text-muted-foreground text-center mt-1">
              ¡Usa el botón + para añadir tu primera!
            </Text>
          </View>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="bg-card rounded-2xl overflow-hidden border border-border"
    >
      <View className="p-5">
        <Text className="text-lg font-semibold text-foreground mb-3">
          Transacciones Recientes
        </Text>
        <FlatList
          data={recentTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransactionItem}
          scrollEnabled={false} // let parent ScrollView handle scrolling
          showsVerticalScrollIndicator={false}
        />
      </View>
    </LinearGradient>
  );
};

export default RecentTransactions;