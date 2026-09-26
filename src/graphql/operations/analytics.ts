import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const MONTHLY_TREND_FRAGMENT = gql`
  fragment MonthlyTrendFields on MonthlyTrend {
    month
    monthLabel
    year
    totalIncome
    totalExpenses
    balance
    isPositive
  }
`;

export const CATEGORY_BREAKDOWN_FRAGMENT = gql`
  fragment CategoryBreakdownFields on CategoryBreakdown {
    category
    amount
    percentage
    transactionCount
  }
`;

export const DAILY_SPENDING_FRAGMENT = gql`
  fragment DailySpendingFields on DailySpending {
    dailyCapacity
    remainingBalance
    daysUntilPayday
    projectedEndBalance
  }
`;

export const SAVINGS_RATE_FRAGMENT = gql`
  fragment SavingsRateFields on SavingsRate {
    rate
    totalIncome
    totalExpenses
    savings
    status
  }
`;

export const SMALL_EXPENSES_FRAGMENT = gql`
  fragment SmallExpensesFields on SmallExpenses {
    totalAmount
    transactionCount
    percentageOfTotal
  }
`;

export const MONTH_COMPARISON_FRAGMENT = gql`
  fragment MonthComparisonFields on MonthComparison {
    currentMonth {
      income
      expenses
      balance
    }
    previousMonth {
      income
      expenses
      balance
    }
    incomeChange
    expensesChange
    balanceChange
  }
`;

// ==================== QUERIES ====================

export const MONTHLY_TREND_QUERY = gql`
  query MonthlyTrend($months: Int!) {
    monthlyTrend(months: $months) {
      ...MonthlyTrendFields
    }
  }
  ${MONTHLY_TREND_FRAGMENT}
`;

export const CATEGORY_BREAKDOWN_QUERY = gql`
  query CategoryBreakdown($startDate: String!, $endDate: String!) {
    categoryBreakdown(startDate: $startDate, endDate: $endDate) {
      ...CategoryBreakdownFields
    }
  }
  ${CATEGORY_BREAKDOWN_FRAGMENT}
`;

export const DAILY_SPENDING_CAPACITY_QUERY = gql`
  query DailySpendingCapacity {
    dailySpendingCapacity {
      ...DailySpendingFields
    }
  }
  ${DAILY_SPENDING_FRAGMENT}
`;

export const SPENDING_BY_DAY_OF_WEEK_QUERY = gql`
  query SpendingByDayOfWeek($startDate: String!, $endDate: String!) {
    spendingByDayOfWeek(startDate: $startDate, endDate: $endDate) {
      dayOfWeek
      totalAmount
      averageAmount
      transactionCount
    }
  }
`;

export const SAVINGS_RATE_QUERY = gql`
  query SavingsRate($months: Int!) {
    savingsRate(months: $months) {
      ...SavingsRateFields
    }
  }
  ${SAVINGS_RATE_FRAGMENT}
`;

export const SMALL_EXPENSES_QUERY = gql`
  query SmallExpenses($threshold: Float!, $startDate: String!, $endDate: String!) {
    smallExpenses(threshold: $threshold, startDate: $startDate, endDate: $endDate) {
      ...SmallExpensesFields
    }
  }
  ${SMALL_EXPENSES_FRAGMENT}
`;

export const MONTH_COMPARISON_QUERY = gql`
  query MonthComparison {
    monthComparison {
      ...MonthComparisonFields
    }
  }
  ${MONTH_COMPARISON_FRAGMENT}
`;
