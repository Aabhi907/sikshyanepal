import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

function isAuthed() {
  return cookies().get('admin_session')?.value === 'authenticated'
}
const ALLOWED_LEVELS = new Set(['plus_two', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate'])

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!Array.isArray(body.education_levels) || !body.education_levels.length || !body.education_levels.every((level: unknown) => ALLOWED_LEVELS.has(String(level)))) return NextResponse.json({ error: 'Choose at least one valid post-SEE college level.' }, { status: 400 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('colleges').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
