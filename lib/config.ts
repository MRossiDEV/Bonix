import { numericEnv, publicEnv, serverEnv } from './env'
import { FeatureFlags } from './types'

export const config = {
  // JWT (server-only; getter throws if missing or placeholder)
  get jwtSecret(): string {
    return serverEnv.jwtSecret
  },
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // QR Token (server-only; getter throws if missing or placeholder)
  get qrTokenSecret(): string {
    return serverEnv.qrTokenSecret
  },
  get qrTokenTTL(): number {
    return numericEnv.qrTokenTTL
  },

  // Platform fees
  get platformFee(): number {
    return numericEnv.platformFee
  },
  get affiliateFee(): number {
    return numericEnv.affiliateFee
  },

  // Feature flags
  features: {
    enableWallet: process.env.ENABLE_WALLET === 'true',
    enableAffiliates: process.env.ENABLE_AFFILIATES === 'true',
    enablePaymentGateway: process.env.ENABLE_PAYMENT_GATEWAY === 'true',
  } as FeatureFlags,

  // App
  get appUrl(): string {
    return publicEnv.appUrl
  },
  nodeEnv: process.env.NODE_ENV || 'development',

  // Reservation
  reservationTTLDays: 15,
}
