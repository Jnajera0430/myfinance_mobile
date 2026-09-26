import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { TrendingUp, CreditCard, Wallet, Plus, Scan } from 'lucide-react-native';
import DashboardLayout from '../components/layout/DashboardLayout';
import TopBar from '../components/layout/TopBar';
import BalanceCard from '../components/finance/BalanceCard';
import SummaryCard from '../components/finance/SummaryCard';
import BudgetThermometer from '../components/finance/BudgetThermometer';
import DailySpendingCapacity from '../components/finance/DailySpendingCapacity';
import QuickInsightsCarousel from '../components/finance/QuickInsightsCarousel';
import IncomeExpenseChart from '../components/finance/IncomeExpenseChart';
import RecentTransactions from '../components/finance/RecentTransactions';
import InvoiceHistory from '../components/finance/InvoiceHistory';
import TransactionForm from '../components/finance/TransactionForm';
import ScanTicketModal from '../components/finance/ScanTicketModal';
import { useFinance } from '../contexts/FinanceContext.graphql';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from '../hooks/use-toast';
import { formatAmount } from '../lib/format';

export default function DashboardScreen() {
  const { summary, isLoading, error, addTransaction, refetch } = useFinance();
  const { user } = useAuth();
  const { currency, language, t } = useSettings();

  const [formVisible, setFormVisible] = useState(false);
  const [scanVisible, setScanVisible] = useState(false);

  const greet = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.greeting.morning');
    if (hour < 19) return t('dashboard.greeting.afternoon');
    return t('dashboard.greeting.evening');
  };

  const handleScanComplete = async (data: {
    amount: number;
    description: string;
    date: string;
    invoiceData?: { rfc?: string; uuid?: string; vendor?: string; rawQRData?: string };
  }) => {
    try {
      await addTransaction({
        type: 'VARIABLE_EXPENSE',
        category: 'shopping',
        amount: data.amount,
        description: data.description,
        date: data.date,
        isRecurring: false,
        isPaid: true,
        invoiceData: data.invoiceData,
      });

      toast({
        title: '¡Ticket escaneado!',
        description: `Gasto de ${formatAmount(data.amount, currency, language)} registrado`,
        variant: 'success',
      });
    } catch {
      toast({
        title: 'No se pudo guardar el gasto',
        description: 'Revisa tu conexión e inténtalo de nuevo.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading && summary.totalIncome === 0 && summary.totalExpenses === 0) {
    return (
      <DashboardLayout>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-muted-foreground mt-4">Cargando tus finanzas…</Text>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={() => void refetch()} tintColor="#6366f1" />
          }
        >
          <TopBar greeting={greet()} name={user?.name} />

          {error && (
            <View className="mx-4 mt-3 rounded-2xl bg-destructive/10 border border-destructive/25 p-4">
              <Text className="text-sm text-destructive font-semibold">
                No pudimos cargar tus datos
              </Text>
              <Text className="text-xs text-destructive/80 mt-1">
                Verifica que el backend esté corriendo e inténtalo de nuevo.
              </Text>
              <TouchableOpacity
                onPress={() => void refetch()}
                className="mt-3 rounded-xl bg-destructive py-2.5 items-center"
              >
                <Text className="text-white text-sm font-semibold">{t('common.retry')}</Text>
              </TouchableOpacity>
            </View>
          )}

          <View className="px-4 mt-2">
            <BalanceCard balance={summary.totalBalance} />
          </View>

          <View className="px-4 mt-4">
            <BudgetThermometer />
          </View>

          <View className="px-4 mt-4">
            <DailySpendingCapacity />
          </View>

          <View className="px-4 mt-4">
            <Text className="text-base font-bold text-foreground mb-3">Resumen del periodo</Text>
            <View className="flex-row gap-3">
              <View className="flex-1">
                <SummaryCard
                  title="Lo que entra"
                  amount={summary.totalIncome}
                  icon={TrendingUp}
                  tone="income"
                  subtitle="Sueldo, bonos y extras"
                />
              </View>
              <View className="flex-1">
                <SummaryCard
                  title="Lo obligatorio"
                  amount={summary.totalFixedExpenses}
                  icon={CreditCard}
                  tone="fixed"
                  subtitle="Arriendo, servicios, seguros"
                />
              </View>
              <View className="flex-1">
                <SummaryCard
                  title="El día a día"
                  amount={summary.totalVariableExpenses}
                  icon={Wallet}
                  tone="variable"
                  subtitle="Comida, transporte, salidas"
                />
              </View>
            </View>
          </View>

          <View className="px-4 mt-6">
            <Text className="text-base font-bold text-foreground mb-3">Vista rápida</Text>
            <QuickInsightsCarousel />
          </View>

          <View className="px-4 mt-6">
            <IncomeExpenseChart />
          </View>

          <View className="px-4 mt-4">
            <RecentTransactions />
          </View>

          <View className="px-4 mt-4 mb-8">
            <InvoiceHistory />
          </View>
        </ScrollView>
      </DashboardLayout>

      <View className="absolute bottom-7 right-4 flex-row gap-3">
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Escanear factura"
          onPress={() => setScanVisible(true)}
          className="w-14 h-14 rounded-full bg-accent items-center justify-center"
          style={{
            shadowColor: '#a855f7',
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 6,
          }}
        >
          <Scan size={24} color="#ffffff" />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Registrar movimiento"
          onPress={() => setFormVisible(true)}
          className="w-14 h-14 rounded-full bg-primary items-center justify-center"
          style={{
            shadowColor: '#6366f1',
            shadowOpacity: 0.35,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
          }}
        >
          <Plus size={26} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <TransactionForm visible={formVisible} onClose={() => setFormVisible(false)} />

      <ScanTicketModal
        visible={scanVisible}
        onClose={() => setScanVisible(false)}
        onScanComplete={handleScanComplete}
      />
    </>
  );
}
