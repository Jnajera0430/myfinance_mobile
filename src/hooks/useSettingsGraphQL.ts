import { useMutation, useQuery } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  MY_SETTINGS_QUERY,
  UPDATE_PAYDAY_MUTATION,
  UPDATE_LANGUAGE_MUTATION,
  UPDATE_CURRENCY_MUTATION,
  UPDATE_DARK_MODE_MUTATION,
  UPDATE_SETTINGS_MUTATION,
} from '../graphql/operations';
import type { UserSettings, UpdateSettingsInput, Language, Currency } from '../graphql/types';
import { useAuth } from '../contexts/AuthContext';

export function useSettingsGraphQL() {
  const { isAuthenticated } = useAuth()
  const { data, loading, error, refetch } = useQuery<{ mySettings: UserSettings }>(
    MY_SETTINGS_QUERY,
    {
      fetchPolicy: 'cache-and-network',
      skip: !isAuthenticated
    }
  );

  const refetchOptions = { refetchQueries: [{ query: MY_SETTINGS_QUERY }] };

  const [updatePaydayMutation, { loading: updatePaydayLoading }] = useMutation<
    { updatePayday: UserSettings },
    { payday: number }
  >(UPDATE_PAYDAY_MUTATION, refetchOptions);

  const [updateLanguageMutation, { loading: updateLanguageLoading }] = useMutation<
    { updateLanguage: UserSettings },
    { language: string }
  >(UPDATE_LANGUAGE_MUTATION, refetchOptions);

  const [updateCurrencyMutation, { loading: updateCurrencyLoading }] = useMutation<
    { updateCurrency: UserSettings },
    { currencyCode: string }
  >(UPDATE_CURRENCY_MUTATION, refetchOptions);

  const [updateDarkModeMutation, { loading: updateDarkModeLoading }] = useMutation<
    { updateDarkMode: UserSettings },
    { darkMode: boolean }
  >(UPDATE_DARK_MODE_MUTATION, refetchOptions);

  const [updateSettingsMutation, { loading: updateSettingsLoading }] = useMutation<
    { updateSettings: UserSettings },
    { input: UpdateSettingsInput }
  >(UPDATE_SETTINGS_MUTATION, refetchOptions);

  const updatePayday = useCallback(
    async (payday: number): Promise<UserSettings | null> => {
      try {
        const { data } = await updatePaydayMutation({ variables: { payday } });
        return data?.updatePayday || null;
      } catch (error) {
        console.error('Update payday error:', error);
        throw error;
      }
    },
    [updatePaydayMutation]
  );
  const updateLanguage = useCallback(
    async (language: Language): Promise<UserSettings | null> => {
      try {
        const { data } = await updateLanguageMutation({ variables: { language } });
        return data?.updateLanguage || null;
      } catch (error) {
        console.error('Update language error:', error);
        throw error;
      }
    },
    [updateLanguageMutation]
  );
  const updateCurrency = useCallback(
    async (currencyCode: Currency): Promise<UserSettings | null> => {
      try {
        const { data } = await updateCurrencyMutation({ variables: { currencyCode } });
        return data?.updateCurrency || null;
      } catch (error) {
        console.error('Update currency error:', error);
        throw error;
      }
    },
    [updateCurrencyMutation]
  );
  const updateDarkMode = useCallback(
    async (darkMode: boolean): Promise<UserSettings | null> => {
      try {
        const { data } = await updateDarkModeMutation({ variables: { darkMode } });
        return data?.updateDarkMode || null;
      } catch (error) {
        console.error('Update dark mode error:', error);
        throw error;
      }
    },
    [updateDarkModeMutation]
  );
  const updateSettings = useCallback(
    async (input: UpdateSettingsInput): Promise<UserSettings | null> => {
      try {
        const { data } = await updateSettingsMutation({ variables: { input } });
        return data?.updateSettings || null;
      } catch (error) {
        console.error('Update settings error:', error);
        throw error;
      }
    },
    [updateSettingsMutation]
  );
  const isLoading = loading || updatePaydayLoading || updateLanguageLoading ||
    updateCurrencyLoading || updateDarkModeLoading || updateSettingsLoading;
  return {
    settings: data?.mySettings,
    isLoading,
    error,
    refetch,
    updatePayday,
    updateLanguage,
    updateCurrency,
    updateDarkMode,
    updateSettings,
  };
}
