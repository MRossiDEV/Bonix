import { NextResponse } from 'next/server'

import { requireAdmin } from '@/lib/admin'

export async function GET(request: Request) {
  const adminContext = await requireAdmin()
  if ('error' in adminContext) {
    return NextResponse.json(
      { error: adminContext.error.message },
      { status: adminContext.error.status }
    )
  }

  const { admin } = adminContext
  const { searchParams } = new URL(request.url)

  const merchantId = searchParams.get('merchantId')
  const status = searchParams.get('status')
  const start = searchParams.get('start')
  const end = searchParams.get('end')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Math.min(parseInt(limitParam, 10), 200) : 100

  let query = admin
    .from('redemptions')
    .select(
      'id, reservation_id, user_id, promo_id, merchant_id, payment_type, promo_amount, wallet_used, cash_paid, cashback_amount, status, confirmed_at, created_at'
    )
    .order('created_at', { ascending: false })
    .limit(Number.isNaN(limit) ? 100 : limit)

  if (merchantId) {
    query = query.eq('merchant_id', merchantId)
  }

  if (status) {
    query = query.eq('status', status)
  }

  if (start) {
    query = query.gte('created_at', start)
  }

  if (end) {
    query = query.lt('created_at', end)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ redemptions: data ?? [] })
}
