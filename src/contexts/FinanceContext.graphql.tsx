import { createContext, useContext, useCallback, useMemo, ReactNode } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import type { ErrorLike } from '@apollo/client';
import {
  CREATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
  FINANCE_SUMMARY_QUERY,
  MY_SETTINGS_QUERY,
  SCANNED_INVOICES_QUERY,
  TRANSACTIONS_QUERY,
  UPDATE_PAYDAY_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
} from '../graphql/operations';
import type {
  CreateTransactionInput,
  FinanceSummary,
  IncomeSummary,
  Transaction,
  TransactionFilterInput,
  TransactionType,
  UpdateTransactionInput,
  UserSettings,
  InvoiceDataInput,
} from '../graphql/types';
import { useAuth } from './AuthContext';
import { getCategoryLabel as labelFromCatalog } from '../lib/categories';

export type {
  Transaction,
  TransactionType,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceSummary,
  IncomeSummary,
};

/** Lo que la UI envia al crear: sin campos gestionados por el servidor. */
export type NewTransactionInput = {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  isRecurring?: boolean;
  isPaid?: boolean;
  recurrencePeriod?: CreateTransactionInput['recurrencePeriod'];
  invoiceData?: InvoiceDataInput;
};

export type TransactionDraft = Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

interface FinanceContextType {
  transactions: Transaction[];
  summary: FinanceSummary;
  incomeSummary: IncomeSummary;
  scannedInvoices: Transaction[];
  payday: number;
  isLoading: boolean;
  error: ErrorLike | null;
  addTransaction: (input: NewTransactionInput) => Promise<Transaction | null>;
  updateTransaction: (id: string, data: Partial<TransactionDraft>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
  setPayday: (day: number) => Promise<void>;
  refetch: () => Promise<unknown>;
}

const EMPTY_SUMMARY: FinanceSummary = {
  totalBalance: 0,
  totalIncome: 0,
  totalFixedExpenses: 0,
  totalVariableExpenses: 0,
  totalExpenses: 0,
};

const EMPTY_INCOME_SUMMARY: IncomeSummary = {
  totalIncome: 0,
  salaryIncome: 0,
  bonusIncome: 0,
  extrasIncome: 0,
  recurringIncome: 0,
};

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const getCategoryLabel = (category?: string | null): string => labelFromCatalog(category);

export const getCategoryIcon = (category?: string | null): string => {
  const icons: Record<string, string> = {
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
  return (category && icons[category]) || '📄';
};

export const getTypeLabel = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
    INCOME: 'Ingreso',
    FIXED_EXPENSE: 'Gasto fijo',
    VARIABLE_EXPENSE: 'Gasto variable',
  };
  return labels[type];
};

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const skip = !isAuthenticated;

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery<{ transactions: Transaction[] }>(TRANSACTIONS_QUERY, {
    variables: { filter: null },
    fetchPolicy: 'cache-and-network',
    skip,
  });

  const {
    data: summaryData,
    loading: summaryLoading,
    refetch: refetchSummary,
  } = useQuery<{ financeSummary: FinanceSummary }>(FINANCE_SUMMARY_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip,
  });

  const {
    data: invoicesData,
    loading: invoicesLoading,
    refetch: refetchInvoices,
  } = useQuery<{ scannedInvoices: Transaction[] }>(SCANNED_INVOICES_QUERY, {
    fetchPolicy: 'cache-and-network',
    skip,
  });

  const { data: settingsData, loading: settingsLoading } = useQuery<{ mySettings: UserSettings }>(
    MY_SETTINGS_QUERY,
    { fetchPolicy: 'cache-and-network', skip },
  );

  const [createMutation] = useMutation<{ createTransaction: Transaction }, { input: CreateTransactionInput }>(
    CREATE_TRANSACTION_MUTATION,
  );
  const [updateMutation] = useMutation<{ updateTransaction: Transaction }, { input: UpdateTransactionInput }>(
    UPDATE_TRANSACTION_MUTATION,
  );
  const [deleteMutation] = useMutation<{ deleteTransaction: boolean }, { id: string }>(
    DELETE_TRANSACTION_MUTATION,
  );
  const [updatePaydayMutation] = useMutation<{ updatePayday: UserSettings }, { payday: number }>(
    UPDATE_PAYDAY_MUTATION,
  );

  const transactions = useMemo(
    () => transactionsData?.transactions ?? [],
    [transactionsData],
  );

  const summary = summaryData?.financeSummary ?? EMPTY_SUMMARY;
  const scannedInvoices = useMemo(() => invoicesData?.scannedInvoices ?? [], [invoicesData]);
  const payday = settingsData?.mySettings?.payday ?? 15;

  const incomeSummary = useMemo<IncomeSummary>(() => {
    const income = transactions.filter((t) => t.type === 'INCOME');
    const sum = (list: Transaction[]) => list.reduce((total, t) => total + Number(t.amount), 0);

    return {
      totalIncome: sum(income),
      salaryIncome: sum(income.filter((t) => t.category === 'salary')),
      bonusIncome: sum(income.filter((t) => t.category === 'bonus')),
      extrasIncome: sum(income.filter((t) => t.category === 'extras' || t.category === 'other_income')),
      recurringIncome: sum(income.filter((t) => t.isRecurring)),
    };
  }, [transactions]);

  const refreshAll = useCallback(async () => {
    await Promise.all([refetchTransactions(), refetchSummary(), refetchInvoices()]);
  }, [refetchTransactions, refetchSummary, refetchInvoices]);

  const addTransaction = useCallback(
    async (input: NewTransactionInput): Promise<Transaction | null> => {
      const { data } = await createMutation({
        variables: {
          input: {
            type: input.type,
            category: input.category,
            amount: Number(input.amount),
            description: input.description,
            date: input.date,
            isRecurring: input.isRecurring ?? false,
            isPaid: input.isPaid ?? false,
            recurrencePeriod: input.recurrencePeriod ?? 'MONTHLY',
            // scannedAt lo fija el servidor; no forma parte del input
            invoiceData: input.invoiceData
              ? {
                  rfc: input.invoiceData.rfc,
                  uuid: input.invoiceData.uuid,
                  vendor: input.invoiceData.vendor,
                  rawQRData: input.invoiceData.rawQRData,
                }
              : undefined,
          },
        },
      });

      await refreshAll();
      return data?.createTransaction ?? null;
    },
    [createMutation, refreshAll],
  );

  const updateTransaction = useCallback(
    async (id: string, data: Partial<TransactionDraft>): Promise<Transaction | null> => {
      const { invoiceData, ...rest } = data;

      const { data: result } = await updateMutation({
        variables: {
          input: {
            id,
            ...rest,
            invoiceData: invoiceData
              ? {
                  rfc: invoiceData.rfc,
                  uuid: invoiceData.uuid,
                  vendor: invoiceData.vendor,
                  rawQRData: invoiceData.rawQRData,
                }
              : undefined,
          },
        },
      });

      await Promise.all([refetchTransactions(), refetchSummary()]);
      return result?.updateTransaction ?? null;
    },
    [updateMutation, refetchTransactions, refetchSummary],
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      const { data } = await deleteMutation({ variables: { id } });
      await refreshAll();
      return data?.deleteTransaction ?? false;
    },
    [deleteMutation, refreshAll],
  );

  const setPayday = useCallback(
    async (day: number) => {
      await updatePaydayMutation({ variables: { payday: day } });
    },
    [updatePaydayMutation],
  );

  const value = useMemo<FinanceContextType>(
    () => ({
      transactions,
      summary,
      incomeSummary,
      scannedInvoices,
      payday,
      isLoading: transactionsLoading || summaryLoading || invoicesLoading || settingsLoading,
      error: transactionsError ?? null,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setPayday,
      refetch: refreshAll,
    }),
    [
      transactions,
      summary,
      incomeSummary,
      scannedInvoices,
      payday,
      transactionsLoading,
      summaryLoading,
      invoicesLoading,
      settingsLoading,
      transactionsError,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      setPayday,
      refreshAll,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance(): FinanceContextType {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
}

export type { TransactionFilterInput };
