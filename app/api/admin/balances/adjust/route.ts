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
    amount?: number
    reason?: string
  }

  try {
    body = (await request.json()) as {
      merchantId?: string
      periodStart?: string
      periodEnd?: string
      amount?: number
      reason?: string
    }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.merchantId || !body.periodStart || !body.periodEnd || body.amount === undefined) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  if (!Number.isFinite(body.amount)) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  if (!body.reason) {
    return NextResponse.json({ error: 'Reason is required' }, { status: 400 })
  }

  const { data, error } = await admin.rpc('apply_balance_adjustment', {
    p_merchant_id: body.merchantId,
    p_period_start: body.periodStart,
    p_period_end: body.periodEnd,
    p_amount: body.amount,
    p_reason: body.reason,
    p_admin_id: user.id,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  await logAudit({
    action: 'MERCHANT_BALANCE_ADJUSTED',
    entityType: 'merchant',
    entityId: body.merchantId,
    userId: user.id,
    metadata: {
      period_start: body.periodStart,
      period_end: body.periodEnd,
      amount: body.amount,
      reason: body.reason,
    },
  })

  return NextResponse.json({ balance: data })
}
