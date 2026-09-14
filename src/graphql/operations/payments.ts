import { gql } from "@apollo/client";
import { USER_FRAGMENT } from "./auth";
// Payments
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

}`;

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
      user {
        ...UserFields
      }
      service {
        ...ServiceFields
      }
      payment {
        ...PaymentFields
      }
      expiresAt
      createdAt
      isUsed
      status
  }
  ${USER_FRAGMENT}
  ${SERVICE_FRAGMENT}
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



export const QUERY_LIST_PAYMENTS = gql`
  query Payments {
    payments{
      ...PaymentFields
    }
  }
  ${PAYMENT_FRAGMENT}
`;

export const QUERY_PAYMENT = gql`
  query PaymentById($id: ID!) {
    paymentById(paymentId: $id) {
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

// Services

export const QUERY_LIST_SERVICES = gql`
  query Services {
    services {
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
    deleteService(id: $id){
    ...ServiceFields
    }
  }
  ${SERVICE_FRAGMENT}
`;

//Tokens 
export const QUERY_LIST_TOKEN = gql`
  query Tokens($userId: String) {
    tokens(userId: $userId) {
      ...TokenFields
    }
  }
  ${TOKEN_FRAGMENT}
`;
export const CREATE_TOKEN = gql`
  mutation CreateToken($input: CreateTokenInput!){
    createToken(input: $input){
      ...TokenFields
    }
  }
  ${TOKEN_FRAGMENT}
`;

export const CREATE_PAYMENT_SESSION = gql`
  mutation CreatePaymentSession($fingerprint: String) {
    createPaymentSession(fingerprint: $fingerprint) {
      id
      expiresAt
    }
  }
`;

export const CREATE_PAYMENT_PUBLIC = gql`
  mutation CreatePaymentPublic($input: CreatePaymentPublicInput!) {
    createPaymentPublic(input: $input) {
      id
      paymentStatus
      externalReference
      createdAt
    }
  }
`;

export const UPDATE_PAYMENT_PUBLIC = gql`
  mutation UpdatePaymentPublic($input: UpdatePaymentPublicInput!){
    updatePaymentPublic(input: $input) {
      id
      paymentStatus
      externalReference
      createdAt
    }
  }
`;

export const GET_PAYMENT_STATUS = gql`
  query GetPaymentStatus($paymentId: String!) {
    payment(id: $paymentId) {
      id
      paymentStatus
      externalReference
      serviceName
      amount
      createdAt
      generatedToken
    }
  }
`;

export const GET_PAYMENT_BY_REFERENCE = gql`
  query GetPaymentByReference($reference: String!) {
    paymentByReference(reference: $reference) {
      id
      paymentStatus
      externalReference
      serviceName
      amount
      createdAt
      generatedToken
    }
  }
`;
