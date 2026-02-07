import { NextRequest, NextResponse } from 'next/server'

import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ promoId: string }> }
) {
  const { promoId } = await params
  const adminContext = await requireAdmin()
  if ('error' in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status }
    )
  }

  const { admin, user } = adminContext

  let body: { reason?: string } = {}
  try {
    body = (await request.json()) as { reason?: string }
  } catch {
    body = {}
  }

  const { data: promo, error: promoError } = await admin
    .from('promos')
    .update({ status: 'DISABLED' })
    .eq('id', promoId)
    .select('id, status, merchant_id')
    .maybeSingle()

  if (promoError) {
    return NextResponse.json({ error: promoError.message }, { status: 400 })
  }

  if (!promo) {
    return NextResponse.json({ error: 'Promo not found' }, { status: 404 })
  }

  await logAudit({
    action: 'PROMO_DISABLED',
    entityType: 'promo',
    entityId: promo.id,
    userId: user.id,
    metadata: {
      reason: body.reason ?? null,
      merchant_id: promo.merchant_id,
    },
  })

  return NextResponse.json({ status: promo.status, promoId: promo.id })
}
