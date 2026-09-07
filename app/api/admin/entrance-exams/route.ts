import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('entrance_exams').select('*').order('created_at', { ascending: false })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.title?.trim() || !body.source_name?.trim() || !/^https?:\/\//.test(body.source_url || '')) return NextResponse.json({ error: 'Title, source name and valid source URL are required.' }, { status: 400 })
  const row = { ...body, title: body.title.trim(), slug: `${slugify(body.title)}-${Date.now()}`, fee: body.fee ? Number(body.fee) : null, exam_date: body.exam_date || null, application_deadline: body.application_deadline || null, program: body.program || null, exam_body: body.exam_body || null, education_level: body.education_level || null, eligibility: body.eligibility || null, description: body.description || null, exam_url: body.exam_url || body.source_url, syllabus_url: body.syllabus_url || null, last_verified_at: new Date().toISOString(), status: body.status === 'published' ? 'published' : 'draft' }
  const { data, error } = await createAdminSupabaseClient().from('entrance_exams').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('entrance_exam.create', 'entrance_exam', data.id, { title: data.title, status: data.status })
  return NextResponse.json(data, { status: 201 })
}
