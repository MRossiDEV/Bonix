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
  const status = searchParams.get('status')

  let query = admin
    .from('merchants')
    .select('id, email, business_name, contact_name, phone, status, created_at, updated_at')

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ merchants: data ?? [] })
}
