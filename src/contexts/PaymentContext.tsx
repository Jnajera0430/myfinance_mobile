import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import type { ErrorLike } from '@apollo/client';
import {
  CREATE_PAYMENT_MUTATION,
  CREATE_PAYMENT_PUBLIC,
  CREATE_PAYMENT_SESSION,
  CREATE_TOKEN,
  DELETE_SERVICE_MUTATION,
  MUTATION_CREATE_SERVICE,
  QUERY_LIST_PAYMENTS,
  QUERY_LIST_SERVICES,
  QUERY_LIST_TOKEN,
  QUERY_TOKENS_BY_USER,
  UPDATE_PAYMENT_PUBLIC,
  UPDATE_PAYMENT_STATUS_MUTATION,
  UPDATE_SERVICE_MUTATION,
} from '@/graphql/operations/payments';
import type {
  CreatePaymentInput,
  CreatePaymentPublicInput,
  CreateServiceInput,
  Payment,
  PaymentStatus,
  Service,
  Token,
  UpdatePaymentPublicInput,
  UpdateServiceInput,
} from '@/types/payments';
import { useAuth } from './AuthContext';
import { stripTypename } from '@/lib/utils';

interface PaymentContextType {
  services: Service[];
  payments: Payment[];
  tokens: Token[];
  loading: boolean;
  error: ErrorLike | null;
  addService: (input: CreateServiceInput) => Promise<Service | null>;
  updateService: (id: string, input: UpdateServiceInput) => Promise<Service | null>;
  deleteService: (id: string) => Promise<Service | null>;
  addPayment: (input: CreatePaymentInput) => Promise<Payment | null>;
  updatePaymentStatus: (id: string, status: PaymentStatus, observation?: string) => Promise<Payment | null>;
  generateToken: (input: { userId: string; serviceId: string; paymentId: string }) => Promise<Token | null>;
  refreshTokens: () => Promise<Token[]>;
  createSessionId: (fingerprint?: string) => Promise<{ id: string; expiresAt: string } | null>;
  addPaymentPublic: (
    input: CreatePaymentPublicInput,
  ) => Promise<{ id: string; paymentStatus: string; externalReference: string; amount: number; createdAt: string } | null>;
  editPaymentPublic: (input: UpdatePaymentPublicInput) => Promise<Payment | null>;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();

  const {
    data: servicesData,
    loading: servicesLoading,
    error: servicesError,
    refetch: refetchServices,
  } = useQuery<{ services: Service[] }>(QUERY_LIST_SERVICES, {
    fetchPolicy: 'cache-and-network',
  });

  const {
    data: paymentsData,
    loading: paymentsLoading,
    error: paymentsError,
    refetch: refetchPayments,
  } = useQuery<{ payments: Payment[] }>(QUERY_LIST_PAYMENTS, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated,
  });

  // Admin: todos los tokens. Cliente: solo los propios.
  const {
    data: adminTokensData,
    refetch: refetchAdminTokens,
  } = useQuery<{ tokens: Token[] }>(QUERY_LIST_TOKEN, {
    variables: { userId: null },
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated || !isAdmin,
  });

  const {
    data: ownTokensData,
    refetch: refetchOwnTokens,
  } = useQuery<{ tokensByUser: Token[] }>(QUERY_TOKENS_BY_USER, {
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated || isAdmin,
  });

  const refetchAll = useCallback(async () => {
    await refetchServices();
    if (isAuthenticated) await refetchPayments();
    if (isAdmin) await refetchAdminTokens();
    else if (isAuthenticated) await refetchOwnTokens();
  }, [isAuthenticated, isAdmin, refetchAdminTokens, refetchOwnTokens, refetchPayments, refetchServices]);

  const [createServiceMutation, { loading: createServiceLoading, error: createServiceError }] =
    useMutation<{ createService: Service }, { input: CreateServiceInput }>(MUTATION_CREATE_SERVICE, {
      refetchQueries: [{ query: QUERY_LIST_SERVICES }],
    });

  const [updateServiceMutation, { loading: updateServiceLoading, error: updateServiceError }] =
    useMutation<{ updateService: Service }, { id: string; input: UpdateServiceInput }>(
      UPDATE_SERVICE_MUTATION,
      { refetchQueries: [{ query: QUERY_LIST_SERVICES }] },
    );

  const [deleteServiceMutation] = useMutation<{ deleteService: Service }, { id: string }>(
    DELETE_SERVICE_MUTATION,
    { refetchQueries: [{ query: QUERY_LIST_SERVICES }] },
  );

  const [createPaymentMutation, { loading: createPaymentLoading, error: createPaymentError }] =
    useMutation<{ createPayment: Payment }, { input: CreatePaymentInput }>(CREATE_PAYMENT_MUTATION);

  const [updatePaymentStatusMutation] = useMutation<
    { updatePaymentStatus: Payment },
    { paymentId: string; status: PaymentStatus; observation?: string }
  >(UPDATE_PAYMENT_STATUS_MUTATION);

  const [createTokenMutation, { loading: createTokenLoading, error: createTokenError }] =
    useMutation<{ createToken: Token }, { input: { userId: string; serviceId: string; paymentId: string } }>(
      CREATE_TOKEN,
    );

  const [createPaymentSession] = useMutation<
    { createPaymentSession: { id: string; expiresAt: string } },
    { fingerprint?: string }
  >(CREATE_PAYMENT_SESSION);

  const [createPaymentPublic] = useMutation<{ createPaymentPublic: Payment }, { input: CreatePaymentPublicInput }>(
    CREATE_PAYMENT_PUBLIC,
  );

  const [updatePaymentPublic] = useMutation<{ updatePaymentPublic: Payment }, { input: UpdatePaymentPublicInput }>(
    UPDATE_PAYMENT_PUBLIC,
  );

  const services = useMemo(() => servicesData?.services ?? [], [servicesData]);
  const payments = useMemo(() => paymentsData?.payments ?? [], [paymentsData]);
  const tokens = useMemo<Token[]>(() => {
    if (isAdmin) return adminTokensData?.tokens ?? [];
    return ownTokensData?.tokensByUser ?? [];
  }, [adminTokensData, isAdmin, ownTokensData]);

  const addService = useCallback(
    async (input: CreateServiceInput) => {
      const { data } = await createServiceMutation({ variables: { input } });
      await refetchServices();
      return data?.createService ?? null;
    },
    [createServiceMutation, refetchServices],
  );

  const updateService = useCallback(
    async (id: string, input: UpdateServiceInput) => {
      const { data } = await updateServiceMutation({
        variables: { id, input: stripTypename(input) },
      });
      await refetchServices();
      return data?.updateService ?? null;
    },
    [refetchServices, updateServiceMutation],
  );

  const deleteService = useCallback(
    async (id: string) => {
      const { data } = await deleteServiceMutation({ variables: { id } });
      await refetchServices();
      return data?.deleteService ?? null;
    },
    [deleteServiceMutation, refetchServices],
  );

  const addPayment = useCallback(
    async (input: CreatePaymentInput) => {
      const { data } = await createPaymentMutation({
        variables: {
          input: {
            amount: input.amount,
            paymentMethod: input.paymentMethod,
            paymentStatus: input.paymentStatus ?? 'PENDING',
            serviceId: input.serviceId,
            observation: input.observation ?? '',
            externalReference: input.externalReference ?? '',
            userEmail: input.userEmail,
            userName: input.userName,
          },
        },
      });
      await refetchPayments();
      return data?.createPayment ?? null;
    },
    [createPaymentMutation, refetchPayments],
  );

  const updatePaymentStatus = useCallback(
    async (id: string, status: PaymentStatus, observation?: string) => {
      const { data } = await updatePaymentStatusMutation({
        variables: { paymentId: id, status, observation },
      });
      await refetchPayments();
      return data?.updatePaymentStatus ?? null;
    },
    [refetchPayments, updatePaymentStatusMutation],
  );

  const generateToken = useCallback(
    async (input: { userId: string; serviceId: string; paymentId: string }) => {
      const payment = payments.find((item) => item.id === input.paymentId);
      if (!payment) throw new Error('Pago no encontrado');
      if (payment.paymentStatus !== 'COMPLETED') throw new Error('Solo se puede generar token de pagos completados');
      if (payment.generatedToken) throw new Error('Este pago ya tiene un token');

      const { data } = await createTokenMutation({ variables: { input } });
      await refetchAll();
      return data?.createToken ?? null;
    },
    [createTokenMutation, payments, refetchAll],
  );

  const refreshTokens = useCallback(async () => {
    if (isAdmin) {
      const { data } = await refetchAdminTokens();
      return data?.tokens ?? [];
    }
    const { data } = await refetchOwnTokens();
    return data?.tokensByUser ?? [];
  }, [isAdmin, refetchAdminTokens, refetchOwnTokens]);

  const createSessionId = useCallback(
    async (fingerprint?: string) => {
      const { data } = await createPaymentSession({ variables: { fingerprint } });
      return data?.createPaymentSession ?? null;
    },
    [createPaymentSession],
  );

  const addPaymentPublic = useCallback(
    async (input: CreatePaymentPublicInput) => {
      const { data } = await createPaymentPublic({ variables: { input } });
      const created = data?.createPaymentPublic;
      if (!created) return null;

      return {
        id: created.id,
        paymentStatus: created.paymentStatus,
        externalReference: created.externalReference,
        amount: created.amount,
        createdAt: created.createdAt,
      };
    },
    [createPaymentPublic],
  );

  const editPaymentPublic = useCallback(
    async (input: UpdatePaymentPublicInput) => {
      const { data } = await updatePaymentPublic({ variables: { input } });
      return data?.updatePaymentPublic ?? null;
    },
    [updatePaymentPublic],
  );

  const loading =
    servicesLoading ||
    paymentsLoading ||
    createServiceLoading ||
    updateServiceLoading ||
    createPaymentLoading ||
    createTokenLoading;

  const error = servicesError ?? paymentsError ?? createServiceError ?? updateServiceError ?? createPaymentError ?? createTokenError ?? null;

  const value = useMemo<PaymentContextType>(
    () => ({
      services,
      payments,
      tokens,
      loading,
      error,
      addService,
      updateService,
      deleteService,
      addPayment,
      updatePaymentStatus,
      generateToken,
      refreshTokens,
      createSessionId,
      addPaymentPublic,
      editPaymentPublic,
    }),
    [
      services,
      payments,
      tokens,
      loading,
      error,
      addService,
      updateService,
      deleteService,
      addPayment,
      updatePaymentStatus,
      generateToken,
      refreshTokens,
      createSessionId,
      addPaymentPublic,
      editPaymentPublic,
    ],
  );

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
}

export function usePayments(): PaymentContextType {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentProvider');
  return ctx;
}
