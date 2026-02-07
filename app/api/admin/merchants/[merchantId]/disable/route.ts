import { NextResponse } from 'next/server'

import { logAudit } from '@/lib/audit'
import { requireAdmin } from '@/lib/admin'

export async function PATCH(
  request: Request,
  { params }: { params: { merchantId: string } }
) {
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

  const { data: merchant, error: merchantError } = await admin
    .from('merchants')
    .update({ status: 'DISABLED' })
    .eq('id', params.merchantId)
    .select('id, status')
    .maybeSingle()

  if (merchantError) {
    return NextResponse.json({ error: merchantError.message }, { status: 400 })
  }

  if (!merchant) {
    return NextResponse.json({ error: 'Merchant not found' }, { status: 404 })
  }

  const { data: disabledPromos } = await admin
    .from('promos')
    .update({ status: 'DISABLED' })
    .eq('merchant_id', params.merchantId)
    .select('id')

  await logAudit({
    action: 'MERCHANT_DISABLED',
    entityType: 'merchant',
    entityId: merchant.id,
    userId: user.id,
    metadata: {
      reason: body.reason ?? null,
      disabled_promos: disabledPromos?.length ?? 0,
    },
  })

  return NextResponse.json({
    status: merchant.status,
    merchantId: merchant.id,
    disabledPromos: disabledPromos?.length ?? 0,
  })
}
