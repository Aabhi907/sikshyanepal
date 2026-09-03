import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'

function isAuthed() { return cookies().get('admin_session')?.value === 'authenticated' }

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('data_corrections').select('*').order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}

