import { User } from "../contexts/AuthContext";

// Enums aligned with NestJS TypePaymentMethods & PaymentStatus enums
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'PAYMENT_GATEWAY' | 'PAYMENT_WHATSAPP';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'REJECTED' | 'EXPIRED';
export enum PaymentStatusEnum {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Rejected = 'REJECTED',
  Expired = 'EXPIRED',
}
export type TokenStatus = 'ACTIVE' | 'USED' | 'EXPIRED';

// Aligned with Service entity (isActive handled server-side)
export type PaymentCurrency = 'COP' | 'USD';

// Aligned with Service entity (isActive handled server-side)
export interface Service {
  id: string;
  name: string;
  description: string;
  /** Maps to `precio` in backend entity */
  price: number;
  /** Currency for payment (COP default) — independent of app display currency */
  paymentCurrency: PaymentCurrency;
  durationDays: number;
  features: string[];
  highlighted?: boolean;
  isActive?: boolean;
}

// Aligned with Payment (Pay) entity
export interface Payment {
  id: string;
  /** FK → users.id */
  user?: {
    id: string,
    email: string,
    name: string
  },
  service?: {
    id: string,
    name: string,
  }
  /** FK → services.id */
  
 
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** PayPal transaction ID or WhatsApp reference */
  externalReference: string;
  observation: string;
  /** true after TokensService.create() succeeds */
  generatedToken: boolean;
  createdAt: string;
  amount: number;
}

export interface CreatePaymentInput {
  amount: number;
  paymentMethod: PaymentMethod;
  userEmail: string;
  userName: string;
  service?: Service;
  observation?: string;
  paymentStatus?: PaymentStatus;
  serviceId: string;
  externalReference?: string;
}

export interface CreatePaymentPublicInput extends CreatePaymentInput {
  sessionId: string
}

export interface UpdatePaymentPublicInput {
  sessionId: string;
  paymentId: string;
  observation?: string;
  status?: PaymentStatus;
}

export interface CreateServiceInput {
  name: string;
  description: string;
  price: number;
  durationDays: number;
  features: string[];
  highlighted?: boolean;
}

export interface UpdateServiceInput {
  name?: string;
  description?: string;
  price?: number;
  durationDays?: number;
  features?: string[];
  highlighted?: boolean;
  isActive?: boolean;
}

// Aligned with Token entity — token is a signed JWT
export interface Token {
  id: string;
  /** Signed JWT (HS256) with { userId, serviceId, expiresIn } */
  token: string;
  /** FK → users.id */
  user?: User;
  /** FK → services.id */
  service?: Omit<Service, 'id'>
  /** FK → payments.id — OneToOne relationship */
  payment?: Payment;
  expiresAt: string;
  createdAt: string;
  isUsed: boolean;
  status: TokenStatus;
}

export interface CreateTokenInput {
  userId: string;
  serviceId: string;
  paymentId: string;
}
