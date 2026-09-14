import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext.graphql';

export type TransactionType = 'INCOME' | 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE';

export type IncomeCategory = 'salary' | 'bonus' | 'extras' | 'other_income';
export type ExpenseCategory = 'rent' | 'utilities' | 'subscriptions' | 'insurance' | 'food' | 'transport' | 'entertainment' | 'shopping' | 'other_expense';
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export interface InvoiceData {
  rfc?: string;
  uuid?: string;
  vendor?: string;
  rawQRData?: string;
  scannedAt?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  isPaid?: boolean;
  isRecurring: boolean;
  createdAt: string;
  invoiceData?: InvoiceData;
}

interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalExpenses: number;
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
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => void;
  updateTransaction: (id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => void;
  deleteTransaction: (id: string) => void;
  isLoading: boolean;
  payday: number;
  setPayday: (day: number) => void;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

const STORAGE_KEY = 'finance_transactions';

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

const PAYDAY_KEY = 'finance_payday';

export function FinanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payday, setPaydayState] = useState<number>(() => {
    const stored = localStorage.getItem(PAYDAY_KEY);
    return stored ? parseInt(stored) : 15; // Default to 15th of month
  });

  const setPayday = useCallback((day: number) => {
    setPaydayState(day);
    localStorage.setItem(PAYDAY_KEY, day.toString());
  }, []);

  // Load transactions from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      if (stored) {
        // Migrate old data to include isRecurring field
        const parsed = JSON.parse(stored);
        const migrated = parsed.map((t: any) => ({
          ...t,
          isRecurring: t.isRecurring ?? false,
          category: t.category === 'extras' && t.type === 'income' ? 'extras' : t.category,
        }));
        setTransactions(migrated);
      } else {
        // Add some demo data for new users
        const demoTransactions: Transaction[] = [
          {
            id: '1',
            userId: user.id,
            type: 'INCOME',
            category: 'salary',
            amount: 45000,
            description: 'Sueldo mensual',
            date: new Date().toISOString().split('T')[0],
            isRecurring: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '6',
            userId: user.id,
            type: 'INCOME',
            category: 'bonus',
            amount: 5000,
            description: 'Bono trimestral',
            date: new Date().toISOString().split('T')[0],
            isRecurring: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            userId: user.id,
            type: 'FIXED_EXPENSE',
            category: 'rent',
            amount: 12000,
            description: 'Renta departamento',
            date: new Date().toISOString().split('T')[0],
            isRecurring: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            userId: user.id,
            type: 'FIXED_EXPENSE',
            category: 'utilities',
            amount: 2500,
            description: 'Luz, agua, internet',
            date: new Date().toISOString().split('T')[0],
            isRecurring: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '4',
            userId: user.id,
            type: 'VARIABLE_EXPENSE',
            category: 'food',
            amount: 3500,
            description: 'Supermercado',
            date: new Date().toISOString().split('T')[0],
            isRecurring: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '5',
            userId: user.id,
            type: 'VARIABLE_EXPENSE',
            category: 'transport',
            amount: 800,
            description: 'Gasolina',
            date: new Date().toISOString().split('T')[0],
            isRecurring: false,
            createdAt: new Date().toISOString(),
          },
        ];
        setTransactions(demoTransactions);
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(demoTransactions));
      }
    } else {
      setTransactions([]);
    }
    setIsLoading(false);
  }, [user]);

  // Save transactions to localStorage
  useEffect(() => {
    if (user && !isLoading) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(transactions));
    }
  }, [transactions, user, isLoading]);

  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newTransaction: Transaction = {
      ...transactionData,
      id: crypto.randomUUID(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    
    setTransactions(prev => [newTransaction, ...prev]);
  }, [user]);

  const updateTransaction = useCallback((id: string, data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...data } : t
    ));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const summary: FinanceSummary = React.useMemo(() => {
    const userTransactions = transactions.filter(t => t.userId === user?.id);
    
    const totalIncome = userTransactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalFixedExpenses = userTransactions
      .filter(t => t.type === 'FIXED_EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalVariableExpenses = userTransactions
      .filter(t => t.type === 'VARIABLE_EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = totalFixedExpenses + totalVariableExpenses;
    const totalBalance = totalIncome - totalExpenses;
    
    return {
      totalBalance,
      totalIncome,
      totalFixedExpenses,
      totalVariableExpenses,
      totalExpenses,
    };
  }, [transactions, user]);

  const incomeSummary: IncomeSummary = React.useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.userId === user?.id && t.type === 'INCOME');
    
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
      totalIncome,
      salaryIncome,
      bonusIncome,
      extrasIncome,
      recurringIncome,
    };
  }, [transactions, user]);

  // Filter transactions with invoice data (scanned invoices)
  const scannedInvoices: Transaction[] = React.useMemo(() => {
    return transactions
      .filter(t => t.userId === user?.id && t.invoiceData)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, user]);

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
