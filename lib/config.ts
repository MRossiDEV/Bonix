import { FeatureFlags } from './types'

export const config = {
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'default-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // QR Token
  qrTokenSecret: process.env.QR_TOKEN_SECRET || 'default-qr-secret',
  qrTokenTTL: parseInt(process.env.QR_TOKEN_TTL_MINUTES || '10', 10),

  // Platform fees
  platformFee: parseInt(process.env.PLATFORM_FEE || '3', 10),
  affiliateFee: parseInt(process.env.AFFILIATE_FEE || '5', 10),

  // Feature flags
  features: {
    enableWallet: process.env.ENABLE_WALLET === 'true',
    enableAffiliates: process.env.ENABLE_AFFILIATES === 'true',
    enablePaymentGateway: process.env.ENABLE_PAYMENT_GATEWAY === 'true',
  } as FeatureFlags,

  // App
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',

  // Reservation
  reservationTTLDays: 15,
}
