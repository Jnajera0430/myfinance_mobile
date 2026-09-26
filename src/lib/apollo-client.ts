import {
  ApolloClient,
  InMemoryCache,
  HttpLink,
  ApolloLink,
} from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { clearAuthStorage, getAuthToken } from './auth-storage';

if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}

const BACKEND_PORT = process.env.EXPO_PUBLIC_API_PORT || '3000';
const PRODUCTION_GRAPHQL_URL =
  process.env.EXPO_PUBLIC_PRODUCTION_API_URL || 'https://backend.mifinanzas.co/graphql';

function resolveDevGraphqlUrl(): string {
  const hostUri =
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || '';
  const lanHost = hostUri.split(':')[0];

  if (Platform.OS === 'android' && (!lanHost || lanHost === 'localhost' || lanHost === '127.0.0.1')) {
    return `http://10.0.2.2:${BACKEND_PORT}/graphql`;
  }

  return `http://${lanHost || 'localhost'}:${BACKEND_PORT}/graphql`;
}

const configuredUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

export const GRAPHQL_URL = configuredUrl
  ? configuredUrl
  : __DEV__
    ? resolveDevGraphqlUrl()
    : PRODUCTION_GRAPHQL_URL;

type UnauthorizedHandler = () => void | Promise<void>;
let onUnauthorized: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null) {
  onUnauthorized = handler;
}

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'include',
});

const authLink = new SetContextLink(async (prevContext) => {
  const token = await getAuthToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    const isUnauthorized = error.errors.some(
      ({ message, extensions }) =>
        extensions?.code === 'UNAUTHENTICATED' ||
        message?.includes('Unauthorized') ||
        message?.includes('JWT'),
    );

    if (isUnauthorized) {
      void (async () => {
        await clearAuthStorage();
        await onUnauthorized?.();
      })();
    }
    return;
  }

  if (__DEV__ && error) {
    console.error(`[GraphQL network error] ${GRAPHQL_URL}:`, error.message);
  }
});

const loggingLink = new ApolloLink((operation, forward) => {
  if (__DEV__) {
    console.log(`[GraphQL] ${operation.operationName} -> ${GRAPHQL_URL}`);
  }
  return forward(operation);
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, loggingLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          transactions: {
            merge(_, incoming) {
              return incoming;
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});

export default apolloClient;
