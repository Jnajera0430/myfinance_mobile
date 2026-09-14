import { createContext, useContext, useCallback, ReactNode, useMemo } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import {
  TRANSACTIONS_QUERY,
  FINANCE_SUMMARY_QUERY,
  SCANNED_INVOICES_QUERY,
  CREATE_TRANSACTION_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
} from '../graphql/operations';
import { MY_SETTINGS_QUERY, UPDATE_PAYDAY_MUTATION } from '../graphql/operations';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceSummary,
  UserSettings,
  TransactionCategory,
  TransactionType,
  IncomeCategory,
  ExpenseCategory,
} from '../graphql/types';
import { useAuth } from './AuthContext';

// Re-export types for backward compatibility
export type { TransactionType, IncomeCategory, ExpenseCategory, TransactionCategory };

export interface InvoiceData {
  rfc?: string;
  uuid?: string;
  vendor?: string;
  rawQRData?: string;
  scannedAt?: string;
}

interface IncomeSummary {
  totalIncome: number;
  salaryIncome: number;
  bonusIncome: number;
  extrasIncome: number;
  recurringIncome: number;
}

interface FinanceContextType {
  transactions: Transaction[];
  summary: FinanceSummary;
  incomeSummary: IncomeSummary;
  scannedInvoices: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
  payday: number;
  setPayday: (day: number) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const getCategoryLabel = (category: TransactionCategory): string => {
  const labels: Record<TransactionCategory, string> = {
    salary: 'Sueldo Principal',
    bonus: 'Bonificaciones',
    extras: 'Ingresos Extras',
    other_income: 'Otros ingresos',
    rent: 'Renta',
    utilities: 'Servicios',
    subscriptions: 'Suscripciones',
    insurance: 'Seguros',
    food: 'Comida',
    transport: 'Transporte',
    entertainment: 'Entretenimiento',
    shopping: 'Compras',
    other_expense: 'Otros gastos',
  };
  return labels[category];
};

const getCategoryIcon = (category: TransactionCategory): string => {
  const icons: Record<TransactionCategory, string> = {
    salary: '💰',
    bonus: '🎁',
    extras: '🚀',
    other_income: '💵',
    rent: '🏠',
    utilities: '💡',
    subscriptions: '📱',
    insurance: '🛡️',
    food: '🍔',
    transport: '🚗',
    entertainment: '🎬',
    shopping: '🛒',
    other_expense: '📦',
  };
  return icons[category];
};

const getTypeLabel = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
    INCOME: 'Ingreso',
    FIXED_EXPENSE: 'Gasto Fijo',
    VARIABLE_EXPENSE: 'Gasto Variable',
  };
  return labels[type];
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  // Fetch transactions
  const {
    data: transactionsData,
    loading: transactionsLoading,
    refetch: refetchTransactions
  } = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated
  });

  // Fetch finance summary
  const {
    data: summaryData,
    loading: summaryLoading,
    refetch: refetchSummary
  } = useQuery<{ financeSummary: FinanceSummary }>(FINANCE_SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated
  });

  // Fetch scanned invoices
  const {
    data: invoicesData,
    loading: invoicesLoading,
    refetch: refetchInvoices
  } = useQuery<{ scannedInvoices: Transaction[] }>(SCANNED_INVOICES_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated
  });

  // Fetch user settings for payday
  const {
    data: settingsData,
    loading: settingsLoading
  } = useQuery<{ mySettings: UserSettings }>(MY_SETTINGS_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated
  });

  // Mutations
  const [createMutation] = useMutation<
    { createTransaction: Transaction },
    { input: CreateTransactionInput }
  >(CREATE_TRANSACTION_MUTATION);

  const [updateMutation] = useMutation<
    { updateTransaction: Transaction },
    { input: UpdateTransactionInput }
  >(UPDATE_TRANSACTION_MUTATION);

  const [deleteMutation] = useMutation<
    { deleteTransaction: boolean },
    { id: string }
  >(DELETE_TRANSACTION_MUTATION);

  const [updatePaydayMutation] = useMutation<
    { updatePayday: UserSettings },
    { payday: number }
  >(UPDATE_PAYDAY_MUTATION);

  const transactions = useMemo(() =>
    (transactionsData?.transactions || []) as Transaction[],
    [transactionsData]
  );

  const summary: FinanceSummary = useMemo(() =>
    summaryData?.financeSummary || {
      totalBalance: 0,
      totalIncome: 0,
      totalFixedExpenses: 0,
      totalVariableExpenses: 0,
      totalExpenses: 0,
    },
    [summaryData]
  );

  const scannedInvoices = useMemo(() =>
    (invoicesData?.scannedInvoices || []) as Transaction[],
    [invoicesData]
  );

  const payday = settingsData?.mySettings?.payday || 15;

  // Calculate income summary from transactions
  const incomeSummary: IncomeSummary = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);

    const salaryIncome = incomeTransactions
      .filter(t => t.category === 'salary')
      .reduce((sum, t) => sum + t.amount, 0);

    const bonusIncome = incomeTransactions
      .filter(t => t.category === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);

    const extrasIncome = incomeTransactions
      .filter(t => t.category === 'extras' || t.category === 'other_income')
      .reduce((sum, t) => sum + t.amount, 0);

    const recurringIncome = incomeTransactions
      .filter(t => t.isRecurring)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      transactions,
      totalIncome,
      salaryIncome,
      bonusIncome,
      extrasIncome,
      recurringIncome,
    };
  }, [transactions]);

  const addTransaction = useCallback(async (transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    // console.log({transactionData});

    try {
      await createMutation({
        variables: {
          input: {
            type: transactionData.type,
            category: transactionData.category,
            amount: transactionData.amount,
            description: transactionData.description,
            date: transactionData.date,
            isRecurring: transactionData.isRecurring,
            invoiceData: transactionData.invoiceData,
          },
        },
      });

      // Refetch all data
      await Promise.all([refetchTransactions(), refetchSummary(), refetchInvoices()]);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }, [createMutation, refetchTransactions, refetchSummary, refetchInvoices]);

  const updateTransaction = useCallback(async (id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    try {
      await updateMutation({
        variables: {
          input: { id, ...data },
        },
      });

      // Refetch data
      await Promise.all([refetchTransactions(), refetchSummary()]);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }, [updateMutation, refetchTransactions, refetchSummary]);

  const deleteTransaction = useCallback(async (id: string) => {
    try {
      await deleteMutation({ variables: { id } });

      // Refetch data
      await Promise.all([refetchTransactions(), refetchSummary(), refetchInvoices()]);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }, [deleteMutation, refetchTransactions, refetchSummary, refetchInvoices]);

  const setPayday = useCallback(async (day: number) => {
    try {
      await updatePaydayMutation({ variables: { payday: day } });
    } catch (error) {
      console.error('Error updating payday:', error);
      throw error;
    }
  }, [updatePaydayMutation]);

  const isLoading = transactionsLoading || summaryLoading || invoicesLoading || settingsLoading;

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        summary,
        incomeSummary,
        scannedInvoices,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        isLoading,
        payday,
        setPayday,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

export { getCategoryLabel, getCategoryIcon, getTypeLabel };
