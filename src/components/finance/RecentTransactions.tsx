import { View, Text, TouchableOpacity } from 'react-native';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useFinance } from '../../contexts/FinanceContext.graphql';
import TransactionItem from './TransactionItem';
import { EmptyState } from '../ui/Card';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';

const RecentTransactions = () => {
  const { transactions } = useFinance();
  const navigation = useNavigation<NavigationProp<MainTabParamList>>();

  const recent = [...transactions]
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
    .slice(0, 5);

  return (
    <View className="rounded-3xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-foreground">Movimientos recientes</Text>
        {recent.length > 0 && (
          <TouchableOpacity
            accessibilityRole="link"
            onPress={() => navigation.navigate('Movements')}
          >
            <Text className="text-xs font-semibold text-primary">Ver todos</Text>
          </TouchableOpacity>
        )}
      </View>

      {recent.length === 0 ? (
        <EmptyState
          emoji="🧾"
          title="Todavía no hay movimientos"
          description="Usa el botón + para añadir el primero."
        />
      ) : (
        recent.map((transaction) => (
          <TransactionItem key={transaction.id} transaction={transaction} compact />
        ))
      )}
    </View>
  );
};

export default RecentTransactions;
