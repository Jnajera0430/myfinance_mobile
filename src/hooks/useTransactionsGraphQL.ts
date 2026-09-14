import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  TRANSACTIONS_QUERY,
  TRANSACTION_QUERY,
  FINANCE_SUMMARY_QUERY,
  SCANNED_INVOICES_QUERY,
  CREATE_TRANSACTION_MUTATION,
  UPDATE_TRANSACTION_MUTATION,
  DELETE_TRANSACTION_MUTATION,
} from '@/graphql/operations';
import type {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  TransactionFilterInput,
  FinanceSummary,
} from '@/graphql/types';

// Hook for fetching all transactions
export function useTransactions(filter?: TransactionFilterInput) {
  const { data, loading, error, refetch } = useQuery<{ transactions: Transaction[] }>(
    TRANSACTIONS_QUERY,
    {
      variables: { filter },
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    transactions: data?.transactions || [],
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for fetching a single transaction
export function useTransaction(id: string) {
  const { data, loading, error, refetch } = useQuery<{ transaction: Transaction }>(
    TRANSACTION_QUERY,
    {
      variables: { id },
      skip: !id,
    }
  );

  return {
    transaction: data?.transaction,
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for finance summary
export function useFinanceSummary() {
  const { data, loading, error, refetch } = useQuery<{ financeSummary: FinanceSummary }>(
    FINANCE_SUMMARY_QUERY,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    summary: data?.financeSummary || {
      totalBalance: 0,
      totalIncome: 0,
      totalFixedExpenses: 0,
      totalVariableExpenses: 0,
      totalExpenses: 0,
    },
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for scanned invoices
export function useScannedInvoices() {
  const { data, loading, error, refetch } = useQuery<{ scannedInvoices: Transaction[] }>(
    SCANNED_INVOICES_QUERY,
    {
      fetchPolicy: 'cache-and-network',
    }
  );

  return {
    scannedInvoices: data?.scannedInvoices || [],
    isLoading: loading,
    error,
    refetch,
  };
}

// Hook for transaction mutations
export function useTransactionMutations() {
  const [createMutation, { loading: createLoading }] = useMutation<
    { createTransaction: Transaction },
    { input: CreateTransactionInput }
  >(CREATE_TRANSACTION_MUTATION, {
    refetchQueries: [
      { query: TRANSACTIONS_QUERY },
      { query: FINANCE_SUMMARY_QUERY },
      { query: SCANNED_INVOICES_QUERY },
    ],
  });

  const [updateMutation, { loading: updateLoading }] = useMutation<
    { updateTransaction: Transaction },
    { input: UpdateTransactionInput }
  >(UPDATE_TRANSACTION_MUTATION, {
    refetchQueries: [
      { query: TRANSACTIONS_QUERY },
      { query: FINANCE_SUMMARY_QUERY },
    ],
  });

  const [deleteMutation, { loading: deleteLoading }] = useMutation<
    { deleteTransaction: boolean },
    { id: string }
  >(DELETE_TRANSACTION_MUTATION, {
    refetchQueries: [
      { query: TRANSACTIONS_QUERY },
      { query: FINANCE_SUMMARY_QUERY },
      { query: SCANNED_INVOICES_QUERY },
    ],
  });

  const createTransaction = useCallback(
    async (input: CreateTransactionInput): Promise<Transaction | null> => {
      try {
        const { data } = await createMutation({ variables: { input } });
        return data?.createTransaction || null;
      } catch (error) {
        console.error('Create transaction error:', error);
        throw error;
      }
    },
    [createMutation]
  );

  const updateTransaction = useCallback(
    async (input: UpdateTransactionInput): Promise<Transaction | null> => {
      try {
        const { data } = await updateMutation({ variables: { input } });
        return data?.updateTransaction || null;
      } catch (error) {
        console.error('Update transaction error:', error);
        throw error;
      }
    },
    [updateMutation]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        const { data } = await deleteMutation({ variables: { id } });
        return data?.deleteTransaction || false;
      } catch (error) {
        console.error('Delete transaction error:', error);
        throw error;
      }
    },
    [deleteMutation]
  );

  return {
    createTransaction,
    updateTransaction,
    deleteTransaction,
    isLoading: createLoading || updateLoading || deleteLoading,
  };
}
