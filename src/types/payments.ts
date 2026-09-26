import type { User } from '../contexts/AuthContext';

// Enums alineados con TypePaymentMethods / PaymentStatus / TokenStatus del backend
export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'PAYMENT_GATEWAY'
  | 'PAYMENT_WHATSAPP';

export type PaymentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED'
  | 'REJECTED'
  | 'EXPIRED';

export const PAYMENT_STATUS_VALUES: PaymentStatus[] = [
  'PENDING',
  'COMPLETED',
  'FAILED',
  'REFUNDED',
  'REJECTED',
  'EXPIRED',
];

/** Alias de compatibilidad para codigo heredado del panel web. */
export enum PaymentStatusEnum {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Refunded = 'REFUNDED',
  Rejected = 'REJECTED',
  Expired = 'EXPIRED',
}

export type TokenStatus = 'ACTIVE' | 'USED' | 'EXPIRED';
export type PaymentCurrency = 'COP' | 'USD';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  /** Moneda del cobro, independiente de la moneda de visualizacion de la app */
  paymentCurrency: PaymentCurrency;
  durationDays: number;
  features: string[];
  highlighted?: boolean;
  isActive?: boolean;
}

export interface Payment {
  id: string;
  user?: { id: string; email: string; name: string };
  service?: { id: string; name: string; price?: number; durationDays?: number };
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Referencia externa (ePayco, PayPal o id de conversacion de WhatsApp) */
  externalReference: string;
  observation: string;
  /** true despues de TokensService.create() */
  generatedToken: boolean;
  amount: number;
  token?: Token | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreatePaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  serviceId: string;
  observation?: string;
  externalReference?: string;
  userEmail: string;
  userName: string;
}

export interface CreatePaymentPublicInput extends CreatePaymentInput {
  sessionId: string;
}

/** El backend expone UpdateStatePaymentPublicInput */
export interface UpdatePaymentPublicInput {
  sessionId: string;
  paymentId: string;
  status: PaymentStatus;
  observation?: string;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  highlighted?: boolean;
  paymentCurrency?: PaymentCurrency;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  features?: string[];
  highlighted?: boolean;
  isActive?: boolean;
  paymentCurrency?: PaymentCurrency;
}

/** El token es un JWT firmado (HS256) con { userId, serviceId, expiresIn } */
export interface Token {
  id: string;
  token: string;
  user?: User;
  service?: Pick<Service, 'name' | 'description' | 'price' | 'durationDays' | 'features' | 'paymentCurrency'>;
  payment?: Payment;
  expiresAt: string;
  createdAt?: string;
  isUsed: boolean;
  status: TokenStatus;
}

export interface CreateTokenInput {
  userId: string;
  serviceId: string;
  paymentId: string;
}
