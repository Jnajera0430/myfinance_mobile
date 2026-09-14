import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { TrendingUp, TrendingDown, CreditCard, Plus, Scan } from 'lucide-react-native';
import { useFinance, TransactionCategory } from '../contexts/FinanceContext.graphql';
import { useFinance as useFinanceLocal, TransactionCategory as TransactionCategoryLocal } from '../contexts/FinanceContext';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout'; // Lo adaptaremos
import TopBar from '../components/layout/TopBar';
import BalanceCard from '../components/finance/BalanceCard';
import SummaryCard from '../components/finance/SummaryCard';
import BudgetThermometer from '../components/finance/BudgetThermometer';
import DailySpendingCapacity from '../components/finance/DailySpendingCapacity';
import QuickInsightsCarousel from '../components/finance/QuickInsightsCarousel';
import IncomeExpenseChart from '../components/finance/IncomeExpenseChart';
import RecentTransactions from '../components/finance/RecentTransactions';
import InvoiceHistory from '../components/finance/InvoiceHistory';
import AddTransactionModal from '../components/finance/AddTransactionModal';
import ScanTicketModal from '../components/finance/ScanTicketModal';

const DashboardScreen = () => {
  const { summary, isLoading, addTransaction } = useFinance();
  // const { summary: summaryLocal, isLoading: isLoadingLocal, addTransaction: addTransactionLocal } = useFinanceLocal();
  // const { isDemo } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  const handleScanComplete = (data: {
    amount: number;
    description: string;
    date: string;
    invoiceData?: {
      rfc?: string;
      uuid?: string;
      vendor?: string;
      rawQRData?: string;
      scannedAt?: string;
    };
  }) => {
    // if (isDemo) {
    //   addTransactionLocal({
    //     type: 'VARIABLE_EXPENSE',
    //     category: 'shopping' as TransactionCategoryLocal,
    //     amount: data.amount,
    //     description: data.description,
    //     date: data.date,
    //     isRecurring: false,
    //     invoiceData: data.invoiceData,
    //   });
    // } else {
      addTransaction({
        type: 'VARIABLE_EXPENSE',
        category: 'shopping' as TransactionCategory,
        amount: data.amount,
        description: data.description,
        date: data.date,
        isRecurring: false,
        invoiceData: data.invoiceData,
      });
    // }
    // toast({
    //   title: '¡Ticket escaneado!',
    //   description: `Gasto de $${data.amount.toLocaleString()} registrado`,
    // });
  };

  // if (isLoadingLocal || isLoading) {
  if (isLoading) {
    return (
      <DashboardLayout>
        <View className="flex-1 items-center justify-center h-[60vh]">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="text-muted-foreground mt-4">Cargando tus finanzas...</Text>
        </View>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout>
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Top Bar */}
          <TopBar />

          {/* Balance Card */}
          <View className="px-4 mt-2">
            {/* <BalanceCard balance={isDemo ? summaryLocal.totalBalance : summary.totalBalance} /> */}
            <BalanceCard balance={summary.totalBalance} />
          </View>

          {/* Budget Thermometer */}
          <View className="px-4 mt-4">
            <BudgetThermometer />
          </View>

          {/* Daily Spending Capacity */}
          <View className="px-4 mt-4">
            <DailySpendingCapacity />
          </View>

          {/* Summary Cards (grid) */}
          <View className="px-4 mt-4">
            <View className="flex-row flex-wrap justify-between">
              <View className="w-[32%]">
                {/* // amount={isDemo ? summaryLocal.totalIncome : summary.totalIncome} */}
                <SummaryCard
                  title="💰 Lo que entra"
                  amount={summary.totalIncome}
                  icon={TrendingUp}
                  color="green"
                  subtitle="Tu sueldo y extras"
                />
              </View>
              {/* amount={isDemo ? summaryLocal.totalFixedExpenses : summary.totalFixedExpenses} */}
              <View className="w-[32%]">
                <SummaryCard
                  title="🏠 Lo obligatorio"
                  amount={summary.totalFixedExpenses}
                  icon={CreditCard}
                  color="orange"
                  subtitle="Renta, servicios, suscripciones"
                />
              </View>
              <View className="w-[32%]">
                {/* amount={isDemo ? summaryLocal.totalVariableExpenses : summary.totalVariableExpenses} */}
                <SummaryCard
                  title="🛒 El día a día"
                  amount={summary.totalVariableExpenses}
                  icon={TrendingDown}
                  color="yellow"
                  subtitle="Comida, transporte, salidas"
                />
              </View>
            </View>
          </View>

          {/* Quick Insights Carousel */}
          <View className="px-4 mt-4">
            <Text className="text-lg font-semibold text-foreground mb-3">
              📊 Vista Rápida
            </Text>
            <QuickInsightsCarousel />
          </View>

          {/* Charts & Activity */}
          <View className="px-4 mt-4">
            <IncomeExpenseChart />
          </View>
          <View className="px-4 mt-4">
            <RecentTransactions />
          </View>

          {/* Invoice History */}
          <View className="px-4 mt-4 mb-8">
            <InvoiceHistory />
          </View>
        </ScrollView>
      </DashboardLayout>

      {/* Floating Action Button (FAB) */}
      <View className="absolute bottom-6 right-4 z-50">
        <View className="flex-row space-x-3">
          <TouchableOpacity
            onPress={() => setIsScanModalOpen(true)}
            className="bg-accent rounded-full w-14 h-14 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Scan size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setIsModalOpen(true)}
            className="bg-primary rounded-full w-14 h-14 items-center justify-center shadow-lg"
            activeOpacity={0.8}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Scan Ticket Modal */}
      <ScanTicketModal
        visible={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onScanComplete={handleScanComplete}
      />
    </>
  );
};

export default DashboardScreen;