import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const isAuthed = isStaff
function validLevel(body: Record<string, unknown>) { const level = String(body.education_level || ''); const type = String(body.institution_type || ''); return !level || (type === 'school' ? ['ECD / Grade 1-10', 'SEE'].includes(level) : ['college', 'university'].includes(type) ? ['+2', 'Diploma', 'Certificate', 'Bachelor', 'Master', 'MPhil', 'PhD'].includes(level) : true) }

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.title?.trim() || !body.institution_name?.trim() || !body.source_name?.trim() || !/^https?:\/\//.test(body.source_url || '')) return NextResponse.json({ error: 'Title, institution and a valid source are required.' }, { status: 400 })
  if (!validLevel(body)) return NextResponse.json({ error: 'Schools may only use ECD/Grade 1–10 or SEE. +2 and higher admissions belong to colleges.' }, { status: 400 })
  if (body.is_sponsored && !body.sponsor_label?.trim()) return NextResponse.json({ error: 'Sponsored admissions require a visible sponsor label.' }, { status: 400 })
  const update = { ...body, school_id: body.school_id || null, college_id: body.college_id || null, updated_at: new Date().toISOString(), published_at: body.status === 'published' ? body.published_at || new Date().toISOString() : body.published_at || null, last_verified_at: body.verification_status === 'unverified' ? null : new Date().toISOString() }
  const { data, error } = await createAdminSupabaseClient().from('admissions').update(update).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('admission.update', 'admission', params.id, { title: data.title, status: data.status })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('admissions').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('admission.delete', 'admission', params.id)
  return NextResponse.json({ success: true })
}
