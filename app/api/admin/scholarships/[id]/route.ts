import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

const isAuthed = isStaff

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (body.source_url && !/^https?:\/\//.test(body.source_url)) return NextResponse.json({ error: 'Official source URL must be valid.' }, { status: 400 })
  body.last_verified_at = new Date().toISOString()
  body.updated_at = new Date().toISOString()
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase.from('scholarships').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { error } = await supabase.from('scholarships').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
