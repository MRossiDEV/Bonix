import { createAdminClient } from './supabase/admin'

type AuditLogInput = {
  action: string
  entityType: string
  entityId: string
  userId?: string | null
  metadata?: Record<string, unknown>
}

export async function logAudit(input: AuditLogInput): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('audit_logs').insert({
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId,
    user_id: input.userId ?? null,
    metadata: input.metadata ?? null,
  })
}
