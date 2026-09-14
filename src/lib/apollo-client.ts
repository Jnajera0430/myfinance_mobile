import {
  ApolloClient, 
  InMemoryCache, 
  HttpLink,
  ApolloLink,
} from '@apollo/client';
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import * as SecureStore from 'expo-secure-store';

if (__DEV__) {
  loadDevMessages();
  loadErrorMessages();
}


const GRAPHQL_URL = __DEV__
  ? 'http://190.0.3.61:3000/graphql'  // IP local de tu máquina
  : 'https://backend.mifinanzas.co/graphql'; // URL de producción

const httpLink = new HttpLink({
  uri: GRAPHQL_URL,
  credentials: 'same-origin', // o 'include' si necesitas enviar cookies
});

// Auth link - adds JWT token to requests
const authLink = new SetContextLink((prevContext, _operation) => {
  const token = SecureStore.getItem('auth_token');
  return {
    headers: {
      ...prevContext.headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

let isRedirecting = false;

const errorLink = new ErrorLink(({ error }) => {
  if (CombinedGraphQLErrors.is(error)) {
    error.errors.forEach(({ message, extensions }) => {
      if (
        (extensions?.code === 'UNAUTHENTICATED' ||
          message.includes('Unauthorized')) &&
        !isRedirecting
      ) {
        isRedirecting = true;

        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        // window.location.replace('/login'); // mejor que href
      }
    });
  } else if (error) {
    console.error(`[Network error]: ${error}`);
  }
});

// Logging link for development
const loggingLink = new ApolloLink((operation, forward) => {
  if (__DEV__) {
    console.log(`[GraphQL] ${operation.operationName}`);
  }
  return forward(operation);
});

if (__DEV__) {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([loggingLink, authLink, httpLink,errorLink]),
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
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default apolloClient;
