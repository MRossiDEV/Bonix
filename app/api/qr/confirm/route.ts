import { NextResponse } from 'next/server'

import { logAudit } from '@/lib/audit'
import { hashQrToken, verifyQrToken } from '@/lib/qr'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PaymentType } from '@/lib/types'

export async function POST(request: Request) {
  const supabase = await createClient()
  const admin = createAdminClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: userRole } = await admin
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'MERCHANT')
    .maybeSingle()

  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { token?: string; walletUsed?: number }
  try {
    body = (await request.json()) as { token?: string; walletUsed?: number }
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
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
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
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
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
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
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
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
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
    .select('id, discounted_price, cashback_percent, status, merchant_id')
    .eq('id', reservation.promo_id)
    .maybeSingle()

  if (!promo || promo.status !== 'ACTIVE' || promo.merchant_id !== user.id) {
    await logAudit({
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
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

  const { data: existingByToken } = await admin
    .from('redemptions')
    .select('id, status')
    .eq('qr_token', tokenHash)
    .maybeSingle()

  if (existingByToken) {
    await logAudit({
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
      entityType: 'redemption',
      entityId: existingByToken.id,
      userId: user.id,
      metadata: {
        status: 'invalid',
        reason: 'token_used',
        token_hash: tokenHash,
      },
    })

    return NextResponse.json(
      { error: 'Token already used', redemptionId: existingByToken.id },
      { status: 409 }
    )
  }

  let walletUsed = body.walletUsed ?? 0
  if (payload.paymentType === PaymentType.FULL_WALLET) {
    walletUsed = promo.discounted_price
  }

  if (payload.paymentType === PaymentType.PARTIAL_WALLET && !body.walletUsed) {
    return NextResponse.json({ error: 'walletUsed required for split payments' }, { status: 400 })
  }

  if (walletUsed < 0 || walletUsed > promo.discounted_price) {
    return NextResponse.json({ error: 'Invalid wallet amount' }, { status: 400 })
  }

  const { data: redemptionId, error: redemptionError } = await admin.rpc('create_redemption', {
    p_reservation_id: reservation.id,
    p_merchant_id: user.id,
    p_payment_type: payload.paymentType,
    p_wallet_used: walletUsed,
  })

  let finalRedemptionId = redemptionId as string | null

  if (redemptionError) {
    const { data: existingRedemption } = await admin
      .from('redemptions')
      .select('id, status')
      .eq('reservation_id', reservation.id)
      .maybeSingle()

    if (!existingRedemption) {
      await logAudit({
        action: 'REDEMPTION_CONFIRM_ATTEMPT',
        entityType: 'reservation',
        entityId: reservation.id,
        userId: user.id,
        metadata: {
          status: 'failed',
          reason: redemptionError.message,
          token_hash: tokenHash,
        },
      })

      return NextResponse.json({ error: redemptionError.message }, { status: 400 })
    }

    finalRedemptionId = existingRedemption.id

    if (existingRedemption.status === 'CONFIRMED') {
      return NextResponse.json({
        status: 'CONFIRMED',
        redemptionId: existingRedemption.id,
        alreadyConfirmed: true,
      })
    }

    if (existingRedemption.status === 'PENDING') {
      const { error: confirmError } = await admin.rpc('confirm_redemption', {
        p_redemption_id: existingRedemption.id,
      })

      if (confirmError) {
        return NextResponse.json({ error: confirmError.message }, { status: 400 })
      }

      return NextResponse.json({ status: 'CONFIRMED', redemptionId: existingRedemption.id })
    }

    return NextResponse.json({ error: 'Redemption not eligible' }, { status: 409 })
  }

  if (!finalRedemptionId) {
    return NextResponse.json({ error: 'Redemption not created' }, { status: 500 })
  }

  await admin
    .from('redemptions')
    .update({
      qr_token: tokenHash,
      qr_generated_at: new Date(payload.ts).toISOString(),
      qr_expires_at: new Date(expiresAt).toISOString(),
    })
    .eq('id', finalRedemptionId)

  const { error: confirmError } = await admin.rpc('confirm_redemption', {
    p_redemption_id: finalRedemptionId,
  })

  if (confirmError) {
    await logAudit({
      action: 'REDEMPTION_CONFIRM_ATTEMPT',
      entityType: 'redemption',
      entityId: finalRedemptionId,
      userId: user.id,
      metadata: {
        status: 'failed',
        reason: confirmError.message,
        token_hash: tokenHash,
      },
    })

    return NextResponse.json({ error: confirmError.message }, { status: 400 })
  }

  await logAudit({
    action: 'REDEMPTION_CONFIRM_ATTEMPT',
    entityType: 'redemption',
    entityId: finalRedemptionId,
    userId: user.id,
    metadata: {
      status: 'confirmed',
      token_hash: tokenHash,
      payment_type: payload.paymentType,
    },
  })

  return NextResponse.json({ status: 'CONFIRMED', redemptionId: finalRedemptionId })
}
