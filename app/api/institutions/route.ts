import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams; const q = params.get('q')?.trim() || ''; const type = params.get('type') === 'school' ? 'school' : 'college'
  if (q.length < 2) return NextResponse.json([])
  const table = type === 'school' ? 'schools' : 'colleges'
  const fields = type === 'school' ? 'id,name,slug,local_level,district,province' : 'id,name,slug,location'
  let query = createServerSupabaseClient().from(table).select(fields).ilike('name', `%${q.slice(0, 80)}%`).order('name').limit(15)
  if (type === 'school') query = query.eq('status', 'active')
  const { data, error } = await query
  return error ? NextResponse.json({ error: 'Institution search is temporarily unavailable.' }, { status: 500 }) : NextResponse.json(data)
}
