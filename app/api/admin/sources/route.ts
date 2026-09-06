import { isStaff } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const { data, error } = await createAdminSupabaseClient().from('content_sources').select('*').order('consecutive_failures', { ascending: false }).order('last_success_at', { ascending: false, nullsFirst: false })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || [])
}

export async function POST(request: Request) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const body = await request.json()
  if (!body.name?.trim() || !/^https:\/\//i.test(body.base_url || '')) return NextResponse.json({ error: 'A source name and HTTPS base URL are required.' }, { status: 400 })
  const permitted = Array.isArray(body.permitted_targets) ? body.permitted_targets.filter((value: unknown) => ['news', 'notice', 'result'].includes(String(value))) : []
  const row = { name: body.name.trim(), base_url: body.base_url.trim(), organization: String(body.organization || '').trim() || null, source_type: ['official', 'institution', 'trusted_media'].includes(body.source_type) ? body.source_type : 'official', trust_level: Math.max(0, Math.min(100, Number(body.trust_level) || 80)), permitted_targets: permitted.length ? permitted : ['news', 'notice', 'result'], fetch_frequency_minutes: Number(body.fetch_frequency_minutes) || null, requires_review: body.requires_review !== false, is_active: body.is_active !== false }
  const { data, error } = await createAdminSupabaseClient().from('content_sources').insert(row).select().single()
  return error ? NextResponse.json({ error: error.code === '23505' ? 'A source with this name already exists.' : error.message }, { status: error.code === '23505' ? 409 : 500 }) : NextResponse.json(data, { status: 201 })
}
