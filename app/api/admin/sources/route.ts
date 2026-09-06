import { isStaff } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const { data, error } = await createAdminSupabaseClient().from('content_sources').select('*').order('consecutive_failures', { ascending: false }).order('last_success_at', { ascending: false, nullsFirst: false })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || [])
}
