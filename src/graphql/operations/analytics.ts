import { gql } from '@apollo/client';
// ==================== FRAGMENTS ====================
export const MONTHLY_TREND_FRAGMENT = gql`
  fragment MonthlyTrendFields on MonthlyTrend {
    month
    year
    totalIncome
    totalExpenses
    balance
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
// ==================== QUERIES ====================
export const MONTHLY_TREND_QUERY = gql`
  query MonthlyTrend($months: Int) {
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
  query SavingsRate($months: Int) {
    savingsRate(months: $months) {
      rate
      totalIncome
      totalExpenses
      savings
      status
    }
  }
`;
export const SMALL_EXPENSES_QUERY = gql`
  query SmallExpenses($threshold: Float, $startDate: String!, $endDate: String!) {
    smallExpenses(threshold: $threshold, startDate: $startDate, endDate: $endDate) {
      totalAmount
      transactionCount
      percentageOfTotal
    }
  }
`;
export const MONTH_COMPARISON_QUERY = gql`
  query MonthComparison {
    monthComparison {
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
  }
`;
