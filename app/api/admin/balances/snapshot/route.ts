import { NextResponse } from 'next/server'

import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/admin'

export async function POST(request: Request) {
  const adminContext = await requireAdmin()
  if ('error' in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status }
    )
  }

  const { admin, user } = adminContext

  let body: {
    merchantId?: string
    periodStart?: string
    periodEnd?: string
    platformFeeRate?: number
    affiliateFeeRate?: number
  }

  try {
    body = (await request.json()) as {
      merchantId?: string
      periodStart?: string
      periodEnd?: string
      platformFeeRate?: number
      affiliateFeeRate?: number
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.merchantId || !body.periodStart || !body.periodEnd) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await admin.rpc('upsert_merchant_balance', {
    p_merchant_id: body.merchantId,
    p_period_start: body.periodStart,
    p_period_end: body.periodEnd,
    p_platform_fee_rate: body.platformFeeRate,
    p_affiliate_fee_rate: body.affiliateFeeRate,
    p_lock: true,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await logAudit({
    action: 'MERCHANT_BALANCE_SNAPSHOT',
    entityType: 'merchant',
    entityId: body.merchantId,
    userId: user.id,
    metadata: {
      period_start: body.periodStart,
      period_end: body.periodEnd,
    },
  })

  return NextResponse.json({ balance: data })
}
