// ==================== ENUMS ====================

export type TransactionType = 'INCOME' | 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE';

export type IncomeCategory = 'salary' | 'bonus' | 'extras' | 'other_income';
export type ExpenseCategory = 'rent' | 'utilities' | 'subscriptions' | 'insurance' | 'food' | 'transport' | 'entertainment' | 'shopping' | 'other_expense';
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export type RecurrencePeriod = 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';

export type Language = 'es' | 'en';
export type Currency = 'MXN' | 'USD' | 'EUR' | 'COP' | 'ARS' | 'CLP' | 'PEN';

// ==================== USER TYPES ====================

export type RoleType = 'admin' | 'client';
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  role: RoleType;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginInput {
  email: string;
  password: string;
}

// ==================== SETTINGS TYPES ====================

export interface UserSettings {
  id: string;
  userId: string;
  language: Language;
  currency: Currency;
  payday: number;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSettingsInput {
  language?: Language;
  currencyCode?: Currency;
  payday?: number;
  darkMode?: boolean;
}

// ==================== TRANSACTION TYPES ====================

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
  isRecurring: boolean;
  isPaid?: boolean;
  recurrencePeriod?: RecurrencePeriod;
  createdAt: string;
  updatedAt?: string;
  invoiceData?: InvoiceData;
}

export interface CreateTransactionInput {
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  isPaid?: boolean;
  recurrencePeriod?: RecurrencePeriod;
  invoiceData?: InvoiceData;
}

export interface UpdateTransactionInput {
  id: string;
  type?: TransactionType;
  category?: TransactionCategory;
  amount?: number;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  isPaid?: boolean;
  recurrencePeriod?: RecurrencePeriod;
}

export interface TransactionFilterInput {
  type?: TransactionType;
  category?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  isPaid?: boolean;
}

// ==================== SUMMARY TYPES ====================

export interface FinanceSummary {
  totalBalance: number;
  totalIncome: number;
  totalFixedExpenses: number;
  totalVariableExpenses: number;
  totalExpenses: number;
}

export interface IncomeSummary {
  totalIncome: number;
  salaryIncome: number;
  bonusIncome: number;
  extrasIncome: number;
  recurringIncome: number;
}

// ==================== CATEGORY TYPES ====================
export interface Category {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
}
// ==================== ANALYTICS TYPES ====================
export interface MonthlyTrend {
  month: number;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}
export interface DailySpending {
  dailyCapacity: number;
  remainingBalance: number;
  daysUntilPayday: number;
  projectedEndBalance: number;
}
export interface SpendingByDayOfWeek {
  dayOfWeek: number;
  totalAmount: number;
  averageAmount: number;
  transactionCount: number;
}
export interface SavingsRate {
  rate: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  status: 'survival' | 'good' | 'excellent';
}
export interface SmallExpenses {
  totalAmount: number;
  transactionCount: number;
  percentageOfTotal: number;
}
export interface MonthData {
  income: number;
  expenses: number;
  balance: number;
}
export interface MonthComparison {
  currentMonth: MonthData;
  previousMonth: MonthData;
  incomeChange: number;
  expensesChange: number;
  balanceChange: number;
}
