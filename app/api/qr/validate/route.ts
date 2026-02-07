import { NextResponse } from 'next/server'

import { logAudit } from '@/lib/audit'
import { hashQrToken, verifyQrToken } from '@/lib/qr'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userProfile } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!userProfile || userProfile.role !== 'MERCHANT') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { token?: string }
  try {
    body = (await request.json()) as { token?: string }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.token) {
    return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  }

  const verification = verifyQrToken(body.token)
  const tokenHash = hashQrToken(body.token)

  if (!verification.valid) {
    await logAudit({
      action: 'QR_SCAN_ATTEMPT',
      entityType: 'merchant',
      entityId: user.id,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: verification.reason,
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
  }

  const { payload, expiresAt } = verification

  const { data: reservation } = await admin
    .from('reservations')
    .select('id, user_id, promo_id, status, expires_at')
    .eq('id', payload.reservationId)
    .maybeSingle()

  if (!reservation) {
    await logAudit({
      action: 'QR_SCAN_ATTEMPT',
      entityType: 'reservation',
      entityId: payload.reservationId,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: 'reservation_not_found',
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  if (reservation.status !== 'ACTIVE' || new Date(reservation.expires_at) <= new Date()) {
    await logAudit({
      action: 'QR_SCAN_ATTEMPT',
      entityType: 'reservation',
      entityId: reservation.id,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: 'reservation_expired',
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: 'Reservation expired' }, { status: 400 })
  }

  if (reservation.promo_id !== payload.promoId) {
    await logAudit({
      action: 'QR_SCAN_ATTEMPT',
      entityType: 'reservation',
      entityId: reservation.id,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: 'promo_mismatch',
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: 'Token mismatch' }, { status: 400 })
  }

  const { data: promo } = await admin
    .from('promos')
    .select('id, title, discounted_price, cashback_percent, status, merchant_id')
    .eq('id', reservation.promo_id)
    .maybeSingle()

  if (!promo || promo.status !== 'ACTIVE' || promo.merchant_id !== user.id) {
    await logAudit({
      action: 'QR_SCAN_ATTEMPT',
      entityType: 'reservation',
      entityId: reservation.id,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: 'promo_not_authorized',
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: 'Promo not authorized' }, { status: 403 })
  }

  const { data: existingRedemption } = await admin
    .from('redemptions')
    .select('id, status')
    .eq('qr_token', tokenHash)
    .maybeSingle()

  if (existingRedemption) {
    await logAudit({
      action: 'QR_SCAN_ATTEMPT',
      entityType: 'redemption',
      entityId: existingRedemption.id,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: 'token_used',
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: 'Token already used' }, { status: 409 })
  }

  const { data: userRecord } = await admin
    .from('users')
    .select('id, name, email')
    .eq('id', reservation.user_id)
    .maybeSingle()

  await logAudit({
    action: 'QR_SCAN_ATTEMPT',
    entityType: 'reservation',
    entityId: reservation.id,
    userId: user.id,
    metadata: {
      status: 'valid',
      token_hash: tokenHash,
      promo_id: promo.id,
      payment_type: payload.paymentType,
    },
  })

  return NextResponse.json({
    valid: true,
    expiresAt,
    summary: {
      reservationId: reservation.id,
      promoId: promo.id,
      promoTitle: promo.title,
      discountedPrice: promo.discounted_price,
      cashbackPercent: promo.cashback_percent,
      paymentType: payload.paymentType,
      user: userRecord ? { id: userRecord.id, name: userRecord.name, email: userRecord.email } : null,
    },
  })
}
