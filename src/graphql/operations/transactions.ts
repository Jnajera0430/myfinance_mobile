import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const INVOICE_DATA_FRAGMENT = gql`
  fragment InvoiceDataFields on InvoiceData {
    rfc
    uuid
    vendor
    rawQRData
    scannedAt
  }
`;

export const TRANSACTION_FRAGMENT = gql`
  fragment TransactionFields on Transaction {
    id
    userId
    type
    category
    amount
    description
    date
    isRecurring
    isPaid
    recurrencePeriod
    createdAt
    updatedAt
    invoiceData {
      ...InvoiceDataFields
    }
  }
  ${INVOICE_DATA_FRAGMENT}
`;

export const FINANCE_SUMMARY_FRAGMENT = gql`
  fragment FinanceSummaryFields on FinanceSummary {
    totalBalance
    totalIncome
    totalFixedExpenses
    totalVariableExpenses
    totalExpenses
  }
`;

// ==================== QUERIES ====================

export const TRANSACTIONS_QUERY = gql`
  query Transactions($filter: TransactionFilterInput) {
    transactions(filter: $filter) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

export const TRANSACTION_QUERY = gql`
  query Transaction($id: ID!) {
    transaction(id: $id) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

export const FINANCE_SUMMARY_QUERY = gql`
  query FinanceSummary {
    financeSummary {
      ...FinanceSummaryFields
    }
  }
  ${FINANCE_SUMMARY_FRAGMENT}
`;

export const SCANNED_INVOICES_QUERY = gql`
  query ScannedInvoices {
    scannedInvoices {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

// ==================== MUTATIONS ====================

export const CREATE_TRANSACTION_MUTATION = gql`
  mutation CreateTransaction($input: CreateTransactionInput!) {
    createTransaction(input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

export const UPDATE_TRANSACTION_MUTATION = gql`
  mutation UpdateTransaction($input: UpdateTransactionInput!) {
    updateTransaction(input: $input) {
      ...TransactionFields
    }
  }
  ${TRANSACTION_FRAGMENT}
`;

export const DELETE_TRANSACTION_MUTATION = gql`
  mutation DeleteTransaction($id: ID!) {
    deleteTransaction(id: $id)
  }
`;
