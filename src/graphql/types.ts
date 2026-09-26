// Tipos alineados con finance_backend/src/schema.gql
// Los enums de GraphQL usan los NOMBRES en mayuscula (INCOME, CLIENT, MONTHLY...).

// ==================== ENUMS ====================

export type TransactionType = 'INCOME' | 'FIXED_EXPENSE' | 'VARIABLE_EXPENSE';

export type IncomeCategory = 'salary' | 'bonus' | 'extras' | 'other_income';
export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'subscriptions'
  | 'insurance'
  | 'food'
  | 'transport'
  | 'entertainment'
  | 'shopping'
  | 'other_expense';
export type TransactionCategory = IncomeCategory | ExpenseCategory;

export type RecurrencePeriod = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type Language = 'es' | 'en';
export type Currency = 'MXN' | 'USD' | 'EUR' | 'COP' | 'ARS' | 'CLP' | 'PEN';

export type RoleType = 'ADMIN' | 'CLIENT';
export type SavingsRateStatus = 'CRITICAL' | 'WARNING' | 'GOOD' | 'EXCELLENT';
export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'REJECTED'
  | 'EXPIRED';

// ==================== USER ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt?: string;
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

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

// ==================== SETTINGS ====================

export interface UserSettings {
  id: string;
  userId: string;
  language: string;
  currency?: string | null;
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

// ==================== TRANSACTIONS ====================

export interface InvoiceData {
  id?: string;
  rfc?: string | null;
  uuid?: string | null;
  vendor?: string | null;
  rawQRData?: string | null;
  scannedAt?: string;
}

export interface InvoiceDataInput {
  rfc?: string;
  uuid?: string;
  vendor?: string;
  rawQRData?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  isRecurring: boolean;
  isPaid: boolean;
  recurrencePeriod: RecurrencePeriod;
  createdAt: string;
  updatedAt: string;
  invoiceData?: InvoiceData | null;
}

export interface CreateTransactionInput {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  isRecurring?: boolean;
  isPaid?: boolean;
  recurrencePeriod?: RecurrencePeriod;
  invoiceData?: InvoiceDataInput;
}

export interface UpdateTransactionInput {
  id: string;
  type?: TransactionType;
  category?: string;
  amount?: number;
  description?: string;
  date?: string;
  isRecurring?: boolean;
  isPaid?: boolean;
  recurrencePeriod?: RecurrencePeriod;
  invoiceData?: InvoiceDataInput;
}

export interface TransactionFilterInput {
  type?: TransactionType;
  category?: string;
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  isPaid?: boolean;
}

// ==================== SUMMARY ====================

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

// ==================== CATEGORIES (catalogo local) ====================

export interface Category {
  value: string;
  label: string;
  icon?: string;
  color?: string;
  type: TransactionType;
}

// ==================== ANALYTICS ====================

export interface MonthlyTrend {
  month: string;
  monthLabel: string;
  year: number;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  isPositive: boolean;
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
  dayOfWeek: string;
  totalAmount: number;
  averageAmount: number;
  transactionCount: number;
}

export interface SavingsRate {
  rate: number;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  status: SavingsRateStatus;
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

// ==================== EXCHANGE RATES ====================

export interface ExchangeRate {
  baseCurrency: string;
  targetCurrency: string;
  rate: number;
  date: string;
  createdAt: string;
}
