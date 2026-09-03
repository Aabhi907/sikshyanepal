import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'

function isAuthed() { return cookies().get('admin_session')?.value === 'authenticated' }
const ALLOWED = new Set(['status', 'verification_status', 'source_name', 'source_url', 'last_verified_at', 'verified_by', 'is_featured'])

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const update = Object.fromEntries(Object.entries(body).filter(([key]) => ALLOWED.has(key)))
  if (!Object.keys(update).length) return NextResponse.json({ error: 'No supported fields.' }, { status: 400 })
  update.updated_at = new Date().toISOString()
  const { data, error } = await createAdminSupabaseClient().from('schools').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

