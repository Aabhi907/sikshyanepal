import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
const authed = () => cookies().get('admin_session')?.value === 'authenticated'

export async function GET(request: Request) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const status = new URL(request.url).searchParams.get('status') || 'pending'
  const db = createAdminSupabaseClient()
  let query = db.from('content_ingestion_items').select('*').order('fetched_at', { ascending: false }).limit(500)
  if (status !== 'all') query = query.eq('status', status)
  const { data, error } = await query
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
}
