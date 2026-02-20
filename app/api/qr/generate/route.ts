import { NextResponse } from 'next/server'

import { logAudit } from '@/lib/audit'
import { generateQrToken, hashQrToken } from '@/lib/qr'
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
    .eq('role', 'USER')
    .maybeSingle()

  if (!userRole) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  let body: { reservationId?: string; paymentType?: PaymentType }
  try {
    body = (await request.json()) as { reservationId?: string; paymentType?: PaymentType }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.reservationId || !body.paymentType) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (!Object.values(PaymentType).includes(body.paymentType)) {
    return NextResponse.json({ error: 'Invalid payment type' }, { status: 400 })
  }

  const { data: reservation } = await admin
    .from('reservations')
    .select('id, user_id, promo_id, status, expires_at')
    .eq('id', body.reservationId)
    .maybeSingle()

  if (!reservation || reservation.user_id !== user.id) {
    return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
  }

  if (reservation.status !== 'ACTIVE' || new Date(reservation.expires_at) <= new Date()) {
    return NextResponse.json({ error: 'Reservation expired' }, { status: 400 })
  }

  const { data: promo } = await admin
    .from('promos')
    .select('id, status')
    .eq('id', reservation.promo_id)
    .maybeSingle()

  if (!promo || promo.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Promo not active' }, { status: 400 })
  }

  const { token, payload, expiresAt } = generateQrToken({
    promoId: promo.id,
    reservationId: reservation.id,
    paymentType: body.paymentType,
  })

  await logAudit({
    action: 'QR_GENERATED',
    entityType: 'reservation',
    entityId: reservation.id,
    userId: user.id,
    metadata: {
      promo_id: promo.id,
      payment_type: body.paymentType,
      token_hash: hashQrToken(token),
      expires_at: new Date(expiresAt).toISOString(),
    },
  })

  return NextResponse.json({ token, expiresAt, payload })
}
