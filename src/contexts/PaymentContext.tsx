import { createContext, useContext, useState, ReactNode, useMemo, useCallback } from 'react';
import { Service, Payment, Token, PaymentStatus, CreatePaymentInput, CreateServiceInput, UpdateServiceInput, CreateTokenInput, CreatePaymentPublicInput, UpdatePaymentPublicInput } from '@/types/payments';
import { useAuth } from './AuthContext.graphql';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client/react';
import { CREATE_PAYMENT_MUTATION, CREATE_PAYMENT_PUBLIC, CREATE_PAYMENT_SESSION, CREATE_TOKEN, MUTATION_CREATE_SERVICE, QUERY_LIST_PAYMENTS, QUERY_LIST_SERVICES, QUERY_LIST_TOKEN, UPDATE_PAYMENT_PUBLIC, UPDATE_PAYMENT_STATUS_MUTATION, UPDATE_SERVICE_MUTATION } from '@/graphql/operations/payments';
import { ErrorLike } from '@apollo/client';
import { stripTypename } from '@apollo/client/utilities';

interface PaymentContextType {
  services: Service[];
  payments: Payment[];
  tokens: Token[];
  loading: boolean;
  error: ErrorLike | null;
  addService: (s: Omit<Service, 'id'>) => void;
  updateService: (s: Service) => void;
  deleteService: (id: string) => void;
  addPayment: (p: Omit<CreatePaymentInput, 'id' | 'createdAt' | 'generatedToken' | 'userId'>) => Promise<Payment>;
  updatePaymentStatus: (id: string, status: PaymentStatus, obs?: string) => Promise<void>;
  generateToken: (paymentId: string) => Promise<Token | null>;
  getTokensByUser: (userId: string) => Promise<Token[]>;
  addPaymentPublic: (input: CreatePaymentPublicInput) => Promise<{ id: string; paymentStatus: string; externalReference: string, createdAt: string }>
  editPaymentPublic: (input: UpdatePaymentPublicInput) => Promise<Payment>
  createSessionId: (fingerprint?: string) => Promise<{
    id: string;
    expiresAt: string;
  }>
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// ── Mock data ──────────────────────────────────────────────────────────────
const INITIAL_SERVICES: Service[] = [
  {
    id: 's1',
    name: 'Básico',
    description: 'Ideal para empezar a controlar tus finanzas',
    price: 29900,
    paymentCurrency: 'COP',
    durationDays: 30,
    features: ['Dashboard completo', 'Hasta 100 transacciones/mes', 'Reportes básicos', 'Soporte por email'],
  },
  {
    id: 's2',
    name: 'Pro',
    description: 'Para quienes quieren el control total',
    price: 59900,
    paymentCurrency: 'COP',
    durationDays: 30,
    features: ['Todo en Básico', 'Transacciones ilimitadas', 'Reportes avanzados', 'Escaneo de tickets', 'Soporte prioritario'],
    highlighted: true,
  },
  {
    id: 's3',
    name: 'Anual Pro',
    description: 'Ahorra 2 meses con el plan anual',
    price: 599000,
    paymentCurrency: 'COP',
    durationDays: 365,
    features: ['Todo en Pro', '12 meses de acceso', 'Exportación de datos', 'API access', 'Soporte 24/7'],
  },
];

const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    user: {
      id: '2',
      name: 'Demo User',
      email: 'demo@saas.com',
    },
    service: {
      id: 's2',
      name: 'Pro',
    },
    paymentMethod: 'PAYMENT_WHATSAPP',
    paymentStatus: 'PENDING',
    externalReference: 'EP-2024-001',
    observation: 'Pago iniciado via ePayco — pendiente confirmación',
    generatedToken: false,
    createdAt: new Date().toISOString(),
    amount: 59900,
  },
];

// ── Token generator ────────────────────────────────────────────────────────
function generateTokenString(): string {
  return `MF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
}

function getTokenStatus(token: Token): Token['status'] {
  if (token.isUsed) return 'USED';
  if (new Date(token.expiresAt) < new Date()) return 'EXPIRED';
  return 'ACTIVE';
}

export function PaymentProvider({ children }: { children: ReactNode }) {
  const { isDemo, isAdmin, isAuthenticated } = useAuth()
  const [servicesDemo, setServicesDemo] = useState<Service[]>(INITIAL_SERVICES);
  const [paymentsDemo, setPaymentsDemo] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [tokensDemo, setTokensDemo] = useState<Token[]>([]);

  // Payments
  const { data: paymentsData, loading: paymentsLoading, error: paymentsError, refetch: updateListPayment } = useQuery<{ payments: Payment[] }>(QUERY_LIST_PAYMENTS, { fetchPolicy: 'cache-and-network', skip: !isAuthenticated });
  const [createPayment, { loading: createPaymentLoading, error: createPaymentError }] = useMutation<{ createPayment: Payment }, { input: CreatePaymentInput }>(CREATE_PAYMENT_MUTATION, {
    refetchQueries: [
      {
        query: QUERY_LIST_PAYMENTS
      }
    ]
  });

  const [updatePayment] = useMutation<{ updatePayment: Payment }, { paymentId: string, status: PaymentStatus, observation?: string }>(UPDATE_PAYMENT_STATUS_MUTATION, {
    refetchQueries: [
      {
        query: QUERY_LIST_PAYMENTS
      }
    ]
  })
  // Services
  const [createService, { loading: createServiceLoading, error: createServiceError }] = useMutation<{ createService: Service }, { input: CreateServiceInput }>(MUTATION_CREATE_SERVICE, { refetchQueries: [{ query: QUERY_LIST_SERVICES }] });
  const [updateServiceMutation, { loading: updateServiceLoading, error: updateServiceError }] = useMutation<{ updateService: Service }, { id: string, input: UpdateServiceInput }>(UPDATE_SERVICE_MUTATION, { refetchQueries: [{ query: QUERY_LIST_SERVICES }] });
  const { data: servicesData, loading: servicesLoading, error: servicesError } = useQuery<{ services: Service[] }>(QUERY_LIST_SERVICES, { fetchPolicy: 'cache-and-network', });

  // Tokens
  const [createToken, { loading: createTokenLoadin, error: createTokenError }] = useMutation<{ createToken: Token }, { input: CreateTokenInput }>(CREATE_TOKEN, { refetchQueries: [QUERY_LIST_TOKEN] });
  const [getTokens] = useLazyQuery<{ tokens: Token[] }, { userId?: string }>(QUERY_LIST_TOKEN, {
    fetchPolicy: 'cache-and-network'
  });


  //payment public
  const [createPaymentSession] = useMutation<{ createPaymentSession: { id: string; expiresAt: string } }, { fingerprint?: string }>(CREATE_PAYMENT_SESSION);
  const [createPaymentPublic] = useMutation<{ createPaymentPublic: { id: string; paymentStatus: string; externalReference: string, createdAt: string } }, { input: CreatePaymentPublicInput }>(CREATE_PAYMENT_PUBLIC);
  const [updatePaymentPublic] = useMutation<{ updatePaymentPublic: Payment }, { input: UpdatePaymentPublicInput }>(UPDATE_PAYMENT_PUBLIC);
  const addService = async (s: Omit<Service, 'id'>) => {
    if (isDemo) {
      const newService: Service = { ...s, id: crypto.randomUUID() };
      setServicesDemo(prev => [...prev, newService]);
      return;
    }
    const newService = await createService({ variables: { input: s } });
    setServicesDemo(prev => [...prev, newService.data.createService]);
  };

  const updateService = async (s: Service) => {
    const result = await updateServiceMutation({ variables: { id: s.id, input: stripTypename(s) } });
    setServicesDemo(prev => prev.map(x => (x.id === s.id ? result.data.updateService : x)));
  };

  const deleteService = async (id: string) => {
    const serviceUpdated = await updateServiceMutation({ variables: { id, input: { isActive: false } } });
    if (serviceUpdated.data?.updateService.isActive === false) {
      setServicesDemo(prev => prev.filter(x => x.id !== id));
    }
  };

  const addPayment = useCallback(async (p: Omit<CreatePaymentInput, 'id' | 'createdAt' | 'generatedToken'>): Promise<Payment> => {
    try {
      if (!isDemo) {
        const result = await createPayment({
          variables: {
            input: {
              amount: p.amount,
              paymentMethod: p.paymentMethod,
              observation: p.observation,
              serviceId: p.serviceId,
              externalReference: p.externalReference,
              userEmail: p.userEmail,
              userName: p.userName,
              paymentStatus: p.paymentStatus,
            },
          },
        });
        await updateListPayment()
        setPaymentsDemo(prev => [...prev, result.data!.createPayment]);
        return result.data?.createPayment;
      } else {
        const user = {
          id: crypto.randomUUID(),
          email: p.userEmail,
          name: p.userName
        }
        const newPayment = { ...p, id: crypto.randomUUID(), createdAt: new Date().toISOString(), generatedToken: false, user, service: p?.service, paymentStatus: 'PENDING' } as Payment;
        setPaymentsDemo(prev => [...prev, newPayment]);
        return newPayment;
      }

    } catch (err) {
      console.error('Error adding payment:', err);
      throw err;
    }
  }, [createPayment, updateListPayment]);

  const updatePaymentStatus = useCallback(async (id: string, status: PaymentStatus, obs?: string) => {
    try {
      if (!isDemo) {
        await updatePayment({
          variables: {
            paymentId: id,
            status,
            observation: obs
          }
        })
        await updateListPayment()
      }
      setPaymentsDemo(prev =>
        prev.map(p => (p.id === id ? { ...p, paymentStatus: status, ...(obs ? { observation: obs } : {}) } : p))
      );

    } catch (err) {
      console.error('Error editing payment:', err);
      throw err;
    }
  }, [updatePayment]);

  const addPaymentPublic = useCallback(async (input: CreatePaymentPublicInput) => {
    const newPaymentCreated = await createPaymentPublic({
      variables: {
        input
      },
    });

    return newPaymentCreated.data.createPaymentPublic
  }, [createPaymentPublic]);

  const editPaymentPublic = useCallback(async (input: UpdatePaymentPublicInput) => {
    const dataUpdated = await updatePaymentPublic({
      variables: {
        input
      }
    })

    return dataUpdated.data.updatePaymentPublic
  }, [updatePaymentPublic]);

  const createSessionId = useCallback(async (fingerprint?: string) => {
    const newSession = await createPaymentSession({
      variables: {
        fingerprint
      }
    })

    return newSession.data.createPaymentSession
  }, [createPaymentSession]);

  const generateToken = useCallback(async (paymentId: string): Promise<Token | null> => {
    try {

      const payment = payments.find(p => p.id === paymentId);
      if (!payment || payment.paymentStatus !== 'COMPLETED') return null;
      if (isDemo) {
        const service = services.find(s => s.id === payment.service.id);
        const durationDays = service?.durationDays ?? 30;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);

        const newToken: Token = {
          id: crypto.randomUUID(),
          token: generateTokenString(),
          user: {
            id: payment.user.id,
            name: payment.user.name,
            email: payment.user.email,
            role: "client",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          service: {
            name: payment.service.name,
            description: "Token generado",
            durationDays: 30,
            features: ['Transacciones ilimitada'],
            paymentCurrency: 'COP',
            price: 10000
          },
          payment: payment,
          /** Links this token to its originating payment (OneToOne in backend) */
          expiresAt: expiresAt.toISOString(),
          createdAt: new Date().toISOString(),
          isUsed: false,
          status: 'ACTIVE',
        };

        setTokensDemo(prev => [...prev, newToken]);
        setPaymentsDemo(prev => prev.map(p => (p.id === paymentId ? { ...p, generatedToken: true } : p)));
        return newToken;
      } else {
        const newToken = await createToken({
          variables: {
            input: {
              paymentId,
              serviceId: payment.service.id,
              userId: payment.user.id
            }
          }
        })

        return newToken.data.createToken
      }
    } catch (err) {
      console.error('Error creating token:', err)
      throw err
    }

  }, [createToken]);

  const getTokensByUser = async (userId: string): Promise<Token[]> => {
    if (isDemo) {
      return tokensDemo
        .filter(t => t?.user.id === userId)
        .map(t => ({ ...t, status: getTokenStatus(t) }));
    }
    const tokensFound = await getTokens({
      variables: {
        userId: isAdmin ? null : userId
      }
    });
    return tokensFound.data.tokens || [];
  };
  // console.log({servicesData, services});
  const loading = isDemo ? false : servicesLoading || createPaymentLoading || createServiceLoading || updateServiceLoading || paymentsLoading || createTokenLoadin;
  const error = isDemo ? null : servicesError || createPaymentError || createServiceError || updateServiceError || paymentsError || createTokenError;
  const payments = useMemo(() => isDemo ? paymentsDemo : paymentsData?.payments || [], [paymentsData, paymentsDemo]);
  const services = useMemo(() => isDemo ? servicesDemo : servicesData?.services || [], [servicesData, servicesDemo]);
  const tokens = useMemo(() => isDemo ? tokensDemo : [], [tokensDemo]);
  return (
    <PaymentContext.Provider
      value={{ services, payments, tokens, addService, updateService, deleteService, addPayment, addPaymentPublic, editPaymentPublic, createSessionId, updatePaymentStatus, generateToken, getTokensByUser, loading, error }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export function usePayments() {
  const ctx = useContext(PaymentContext);
  if (!ctx) throw new Error('usePayments must be used within PaymentProvider');
  return ctx;
}
