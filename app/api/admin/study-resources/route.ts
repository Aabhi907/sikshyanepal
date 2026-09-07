import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const tables = { syllabus: 'syllabus', question: 'old_questions' } as const
type ResourceKind = keyof typeof tables

function isValidUrl(value: unknown) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export async function GET() {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const [syllabi, questions, programs, universities] = await Promise.all([
    db.from('syllabus').select('*,program:programs(name),university:universities(name,short_name)').order('created_at', { ascending: false }),
    db.from('old_questions').select('*,program:programs(name),university:universities(name,short_name)').order('created_at', { ascending: false }),
    db.from('programs').select('id,name').order('name'),
    db.from('universities').select('id,name,short_name').order('name'),
  ])
  const error = syllabi.error || questions.error || programs.error || universities.error
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    resources: [
      ...(syllabi.data || []).map(item => ({ ...item, kind: 'syllabus' as const })),
      ...(questions.data || []).map(item => ({ ...item, kind: 'question' as const })),
    ],
    programs: programs.data || [],
    universities: universities.data || [],
  }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const kind = body.kind as ResourceKind
  if (!(kind in tables)) return NextResponse.json({ error: 'Choose a valid resource type.' }, { status: 400 })
  const name = kind === 'syllabus' ? body.title?.trim() : body.subject?.trim()
  if (!name || !body.program_id || !body.university_id || !isValidUrl(body.file_url) || !isValidUrl(body.source_url)) {
    return NextResponse.json({ error: 'Program, university, title, file URL and official source URL are required.' }, { status: 400 })
  }
  const row = {
    program_id: body.program_id,
    university_id: body.university_id,
    semester: body.semester?.trim() || null,
    ...(kind === 'syllabus' ? { title: name } : { subject: name, year: body.year ? Number(body.year) : null }),
    file_url: body.file_url.trim(),
    source_url: body.source_url.trim(),
    last_verified_at: new Date().toISOString(),
    is_published: Boolean(body.is_published),
  }
  const db = createAdminSupabaseClient()
  const result = kind === 'syllabus'
    ? await db.from('syllabus').insert(row as { program_id: string; university_id: string; semester: string | null; title: string; file_url: string; source_url: string; last_verified_at: string; is_published: boolean }).select().single()
    : await db.from('old_questions').insert(row as { program_id: string; university_id: string; semester: string | null; subject: string; year: number | null; file_url: string; source_url: string; last_verified_at: string; is_published: boolean }).select().single()
  const { data, error } = result
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('study_resource.create', kind, data.id, { published: row.is_published })
  return NextResponse.json({ ...data, kind }, { status: 201 })
}
