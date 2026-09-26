import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    name
    avatar
    role
    createdAt
    updatedAt
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
  mutation Register($registerInput: RegisterInput!) {
    register(registerInput: $registerInput) {
      ...AuthResponseFields
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

export const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      ...UserFields
    }
  }
  ${USER_FRAGMENT}
`;

// ==================== QUERIES (tokens de acceso) ====================

export const VERIFY_TOKEN = gql`
  query ValidateToken {
    validateToken
  }
`;
