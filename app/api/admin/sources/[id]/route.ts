import { isStaff } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const body = await request.json()
  const allowed = ['organization', 'source_type', 'trust_level', 'permitted_targets', 'fetch_frequency_minutes', 'requires_review', 'is_active']
  const update = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))
  if (update.trust_level != null) update.trust_level = Math.max(0, Math.min(100, Number(update.trust_level) || 80))
  if (update.permitted_targets) update.permitted_targets = Array.isArray(update.permitted_targets) ? update.permitted_targets.filter((value: unknown) => ['news', 'notice', 'result'].includes(String(value))) : []
  const { data, error } = await createAdminSupabaseClient().from('content_sources').update(update).eq('id', params.id).select().single()
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
}
