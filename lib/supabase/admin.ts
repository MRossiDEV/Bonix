import { createClient } from '@supabase/supabase-js'

import { publicEnv, serverEnv } from '@/lib/env'

export function createAdminClient() {
  return createClient(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
