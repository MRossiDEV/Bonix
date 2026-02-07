import crypto from 'crypto'

import { config } from './config'
import { PaymentType } from './types'

export type QrPayload = {
  promoId: string
  reservationId: string
  paymentType: PaymentType
  ts: number
  nonce: string
  v: number
}

type VerifyResult =
  | { valid: true; payload: QrPayload; expiresAt: number }
  | { valid: false; reason: string }

function toBase64Url(input: Buffer | string): string {
  const buffer = typeof input === 'string' ? Buffer.from(input) : input
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/')
  const padLength = (4 - (padded.length % 4)) % 4
  return Buffer.from(padded + '='.repeat(padLength), 'base64')
}

function sign(input: string, secret: string): string {
  return toBase64Url(crypto.createHmac('sha256', secret).update(input).digest())
}

export function generateQrToken(params: {
  promoId: string
  reservationId: string
  paymentType: PaymentType
  now?: number
}): { token: string; payload: QrPayload; expiresAt: number } {
  const ts = params.now ?? Date.now()
  const payload: QrPayload = {
    promoId: params.promoId,
    reservationId: params.reservationId,
    paymentType: params.paymentType,
    ts,
    nonce: toBase64Url(crypto.randomBytes(16)),
    v: 1,
  }

  const payloadB64 = toBase64Url(JSON.stringify(payload))
  const signature = sign(payloadB64, config.qrTokenSecret)
  const token = `${payloadB64}.${signature}`
  const expiresAt = ts + config.qrTokenTTL * 60 * 1000

  return { token, payload, expiresAt }
}

export function verifyQrToken(token: string): VerifyResult {
  if (!token || !token.includes('.')) {
    return { valid: false, reason: 'missing_token' }
  }

  const [payloadB64, signature] = token.split('.')
  if (!payloadB64 || !signature) {
    return { valid: false, reason: 'invalid_format' }
  }

  const expected = sign(payloadB64, config.qrTokenSecret)
  const expectedBuffer = Buffer.from(expected)
  const signatureBuffer = Buffer.from(signature)

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !crypto.timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return { valid: false, reason: 'invalid_signature' }
  }

  let payload: QrPayload
  try {
    payload = JSON.parse(fromBase64Url(payloadB64).toString('utf-8')) as QrPayload
  } catch {
    return { valid: false, reason: 'invalid_payload' }
  }

  if (!payload.ts || !payload.reservationId || !payload.promoId || !payload.paymentType) {
    return { valid: false, reason: 'missing_fields' }
  }

  const expiresAt = payload.ts + config.qrTokenTTL * 60 * 1000
  if (Date.now() > expiresAt) {
    return { valid: false, reason: 'expired' }
  }

  return { valid: true, payload, expiresAt }
}

export function hashQrToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}
