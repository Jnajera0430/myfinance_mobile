import { gql } from '@apollo/client';

// ==================== QUERIES ====================

export const VALIDATE_VERIFICATION_TOKEN = gql`
  query ValidateVerificationToken($token: String!) {
    validateVerificationToken(token: $token) {
      valid
      email
    }
  }
`;

// ==================== MUTATIONS ====================

export const SET_PASSWORD_WITH_TOKEN = gql`
  mutation SetPasswordWithToken($token: String!, $newPassword: String!) {
    setPasswordWithToken(token: $token, newPassword: $newPassword) {
      success
      message
    }
  }
`;
