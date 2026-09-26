import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const PAYMENT_FRAGMENT = gql`
  fragment PaymentFields on Payment {
    id
    amount
    paymentMethod
    paymentStatus
    externalReference
    generatedToken
    observation
    token {
      id
      token
      expiresAt
      status
    }
    service {
      id
      name
      price
      durationDays
    }
    user {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
`;

export const SERVICE_FRAGMENT = gql`
  fragment ServiceFields on Service {
    id
    name
    description
    price
    durationDays
    features
    highlighted
    paymentCurrency
    isActive
  }
`;

export const TOKEN_FRAGMENT = gql`
  fragment TokenFields on Token {
    id
    token
    expiresAt
    createdAt
    isUsed
    status
    user {
      id
      name
      email
    }
    service {
      id
      name
      price
      durationDays
    }
  }
`;

// ==================== SERVICES ====================

export const QUERY_LIST_SERVICES = gql`
  query Services {
    services {
      ...ServiceFields
    }
  }
  ${SERVICE_FRAGMENT}
`;

export const QUERY_SERVICE = gql`
  query Service($id: ID!) {
    service(id: $id) {
      ...ServiceFields
    }
  }
  ${SERVICE_FRAGMENT}
`;

export const MUTATION_CREATE_SERVICE = gql`
  mutation CreateService($input: CreateServiceInput!) {
    createService(input: $input) {
      ...ServiceFields
    }
  }
  ${SERVICE_FRAGMENT}
`;

export const UPDATE_SERVICE_MUTATION = gql`
  mutation UpdateService($id: ID!, $input: UpdateServiceInput!) {
    updateService(id: $id, input: $input) {
      ...ServiceFields
    }
  }
  ${SERVICE_FRAGMENT}
`;

export const DELETE_SERVICE_MUTATION = gql`
  mutation DeleteService($id: ID!) {
    deleteService(id: $id) {
      ...ServiceFields
    }
  }
  ${SERVICE_FRAGMENT}
`;

// ==================== PAYMENTS ====================

export const QUERY_LIST_PAYMENTS = gql`
  query Payments {
    payments {
      ...PaymentFields
    }
  }
  ${PAYMENT_FRAGMENT}
`;

export const QUERY_PAYMENT = gql`
  query PaymentById($paymentId: ID!) {
    paymentById(paymentId: $paymentId) {
      ...PaymentFields
    }
  }
  ${PAYMENT_FRAGMENT}
`;

export const CREATE_PAYMENT_MUTATION = gql`
  mutation CreatePayment($input: CreatePaymentInput!) {
    createPayment(input: $input) {
      ...PaymentFields
    }
  }
  ${PAYMENT_FRAGMENT}
`;

export const UPDATE_PAYMENT_STATUS_MUTATION = gql`
  mutation UpdatePaymentStatus($paymentId: ID!, $status: PaymentStatus!, $observation: String) {
    updatePaymentStatus(paymentId: $paymentId, status: $status, observation: $observation) {
      ...PaymentFields
    }
  }
  ${PAYMENT_FRAGMENT}
`;

// Flujo publico de checkout (sin autenticacion, protegido por nonce de sesion)
export const CREATE_PAYMENT_SESSION = gql`
  mutation CreatePaymentSession($fingerprint: String) {
    createPaymentSession(fingerprint: $fingerprint) {
      id
      expiresAt
      isUsed
    }
  }
`;

export const CREATE_PAYMENT_PUBLIC = gql`
  mutation CreatePaymentPublic($input: CreatePaymentPublicInput!) {
    createPaymentPublic(input: $input) {
      id
      paymentStatus
      externalReference
      amount
      createdAt
    }
  }
`;

export const UPDATE_PAYMENT_PUBLIC = gql`
  mutation UpdatePaymentPublic($input: UpdateStatePaymentPublicInput!) {
    updatePaymentPublic(input: $input) {
      id
      paymentStatus
      externalReference
      amount
      createdAt
    }
  }
`;

// ==================== TOKENS ====================

/** Admin: tokens de todos los usuarios (o de uno con userId). */
export const QUERY_LIST_TOKEN = gql`
  query Tokens($userId: String) {
    tokens(userId: $userId) {
      ...TokenFields
    }
  }
  ${TOKEN_FRAGMENT}
`;

/** Cliente: sus propios tokens. */
export const QUERY_TOKENS_BY_USER = gql`
  query TokensByUser {
    tokensByUser {
      ...TokenFields
    }
  }
  ${TOKEN_FRAGMENT}
`;

/** Cliente: token activo actual (puede ser null). */
export const QUERY_TOKEN_BY_USER = gql`
  query TokenByUser {
    tokenByUser {
      ...TokenFields
    }
  }
  ${TOKEN_FRAGMENT}
`;

export const CREATE_TOKEN = gql`
  mutation CreateToken($input: CreateTokenInput!) {
    createToken(input: $input) {
      ...TokenFields
    }
  }
  ${TOKEN_FRAGMENT}
`;
