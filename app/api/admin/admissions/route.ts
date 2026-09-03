import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

function isAuthed() { return cookies().get('admin_session')?.value === 'authenticated' }

export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('admissions').select('*').order('created_at', { ascending: false }).limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.title?.trim() || !body.institution_name?.trim() || !body.source_name?.trim() || !/^https?:\/\//.test(body.source_url || '')) return NextResponse.json({ error: 'Title, institution and a valid source are required.' }, { status: 400 })
  if (body.is_sponsored && !body.sponsor_label?.trim()) return NextResponse.json({ error: 'Sponsored admissions require a visible sponsor label.' }, { status: 400 })
  const row = { ...body, title: body.title.trim(), institution_name: body.institution_name.trim(), slug: body.slug?.trim() || `${slugify(body.title)}-${Date.now()}`, school_id: body.school_id || null, college_id: body.college_id || null, published_at: body.status === 'published' ? new Date().toISOString() : null, last_verified_at: body.verification_status === 'unverified' ? null : new Date().toISOString() }
  const { data, error } = await createAdminSupabaseClient().from('admissions').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

