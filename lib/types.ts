// Core application enums and types

export enum UserRole {
  USER = 'USER',
  MERCHANT = 'MERCHANT',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN'
}

export enum PromoStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  EXPIRED = 'EXPIRED'
}

export enum ReservationStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  REDEEMED = 'REDEEMED',
  CANCELLED = 'CANCELLED'
}

export enum RedemptionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentType {
  FULL_WALLET = 'FULL_WALLET',
  PARTIAL_WALLET = 'PARTIAL_WALLET',
  IN_STORE = 'IN_STORE'
}

export type FeatureFlags = {
  enableWallet: boolean
  enableAffiliates: boolean
  enablePaymentGateway: boolean
}
