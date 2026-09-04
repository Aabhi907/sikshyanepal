import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams; const q = params.get('q')?.trim() || ''; const type = params.get('type') === 'school' ? 'school' : 'college'
  if (q.length < 2) return NextResponse.json([])
  const table = type === 'school' ? 'schools' : 'colleges'
  const { data, error } = await createServerSupabaseClient().from(table).select('id,name,slug').ilike('name', `%${q.slice(0, 80)}%`).limit(15)
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
}
