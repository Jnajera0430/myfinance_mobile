import { gql } from '@apollo/client';

// ==================== FRAGMENTS ====================

export const USER_SETTINGS_FRAGMENT = gql`
  fragment UserSettingsFields on UserSettings {
    id
    userId
    language
    currency
    payday
    darkMode
    createdAt
    updatedAt
  }
`;

// ==================== QUERIES ====================

export const MY_SETTINGS_QUERY = gql`
  query MySettings {
    mySettings {
      ...UserSettingsFields
    }
  }
  ${USER_SETTINGS_FRAGMENT}
`;

// ==================== MUTATIONS ====================

export const UPDATE_PAYDAY_MUTATION = gql`
  mutation UpdatePayday($payday: Int!) {
    updatePayday(payday: $payday) {
      ...UserSettingsFields
    }
  }
  ${USER_SETTINGS_FRAGMENT}
`;

export const UPDATE_LANGUAGE_MUTATION = gql`
  mutation UpdateLanguage($language: String!) {
    updateLanguage(language: $language) {
      ...UserSettingsFields
    }
  }
  ${USER_SETTINGS_FRAGMENT}
`;

export const UPDATE_CURRENCY_MUTATION = gql`
  mutation UpdateCurrency($currencyCode: String!) {
    updateCurrency(currencyCode: $currencyCode) {
      ...UserSettingsFields
    }
  }
  ${USER_SETTINGS_FRAGMENT}
`;

export const UPDATE_DARK_MODE_MUTATION = gql`
  mutation UpdateDarkMode($darkMode: Boolean!) {
    updateDarkMode(darkMode: $darkMode) {
      ...UserSettingsFields
    }
  }
  ${USER_SETTINGS_FRAGMENT}
`;

export const UPDATE_SETTINGS_MUTATION = gql`
  mutation UpdateSettings($input: UpdateSettingsInput!) {
    updateSettings(input: $input) {
      ...UserSettingsFields
    }
  }
  ${USER_SETTINGS_FRAGMENT}
`;
