import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'

function isAuthed() { return cookies().get('admin_session')?.value === 'authenticated' }

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.title?.trim() || !body.institution_name?.trim() || !body.source_name?.trim() || !/^https?:\/\//.test(body.source_url || '')) return NextResponse.json({ error: 'Title, institution and a valid source are required.' }, { status: 400 })
  if (body.is_sponsored && !body.sponsor_label?.trim()) return NextResponse.json({ error: 'Sponsored admissions require a visible sponsor label.' }, { status: 400 })
  const update = { ...body, school_id: body.school_id || null, college_id: body.college_id || null, updated_at: new Date().toISOString(), published_at: body.status === 'published' ? body.published_at || new Date().toISOString() : body.published_at || null, last_verified_at: body.verification_status === 'unverified' ? null : new Date().toISOString() }
  const { data, error } = await createAdminSupabaseClient().from('admissions').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('admissions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}

