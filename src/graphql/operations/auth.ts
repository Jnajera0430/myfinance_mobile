import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    name
    avatar
    createdAt
    role
  }
`;

export const AUTH_RESPONSE_FRAGMENT = gql`
  fragment AuthResponseFields on AuthResponse {
    accessToken
    user {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// ==================== QUERIES ====================

export const ME_QUERY = gql`
  query Me {
    me {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// ==================== MUTATIONS ====================

export const LOGIN_MUTATION = gql`
  mutation Login($loginInput: LoginInput!) {
    login(loginInput: $loginInput) {
      ...AuthResponseFields
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

export const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      ...AuthResponseFields
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

export const VERIFY_TOKEN = gql`
  query ValidateToken {
    validateToken
  }
`;
