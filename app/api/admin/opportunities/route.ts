import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'

const TYPES = ['internship', 'apprenticeship', 'fellowship', 'competition', 'course', 'volunteering', 'project']
const validUrl = (value: unknown) => typeof value === 'string' && /^https?:\/\//.test(value)

export async function GET() {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await createAdminSupabaseClient().from('student_opportunities').select('*').order('created_at', { ascending: false })
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || [], { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!body.title?.trim() || !body.organisation?.trim() || !body.summary?.trim() || !TYPES.includes(body.opportunity_type) || !validUrl(body.application_url) || !validUrl(body.source_url)) {
    return NextResponse.json({ error: 'Title, organisation, type, summary, application link and official source are required.' }, { status: 400 })
  }
  const published = Boolean(body.is_published)
  const now = new Date().toISOString()
  const row = {
    title: body.title.trim(), slug: `${slugify(body.title)}-${Date.now()}`, opportunity_type: body.opportunity_type,
    organisation: body.organisation.trim(), location: body.location?.trim() || null, eligibility: body.eligibility?.trim() || null,
    summary: body.summary.trim(), application_url: body.application_url.trim(), source_url: body.source_url.trim(),
    deadline: body.deadline || null, is_verified: published, is_published: published, last_verified_at: now, updated_at: now,
  }
  const { data, error } = await createAdminSupabaseClient().from('student_opportunities').insert(row).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('opportunity.create', 'student_opportunity', data.id, { title: data.title, published })
  return NextResponse.json(data, { status: 201 })
}
