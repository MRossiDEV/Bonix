import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export type AdminContext =
  | {
      admin: ReturnType<typeof createAdminClient>
      user: { id: string; email?: string | null }
    }
  | {
      error: { status: number; message: string }
    }

export async function requireAdmin(): Promise<AdminContext> {
  const supabase = await createClient()
  const admin = createAdminClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { status: 401, message: 'Unauthorized' } }
  }

  const { data: userProfile } = await admin
    .from('users')
    .select('id, role')
    .eq('id', user.id)
    .maybeSingle()

  if (!userProfile || userProfile.role !== 'ADMIN') {
    return { error: { status: 403, message: 'Forbidden' } }
  }

  return { admin, user }
}
