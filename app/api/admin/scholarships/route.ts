import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const isAuthed = isStaff

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('scholarships')
    .select('*, college:colleges(id, name, slug)')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.title?.trim() || !body.provider_name?.trim() || !body.source_name?.trim() || !/^https?:\/\//.test(body.source_url || '')) return NextResponse.json({ error: 'Title, provider and a valid official source are required.' }, { status: 400 })
  body.last_verified_at = new Date().toISOString()
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase.from('scholarships').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
