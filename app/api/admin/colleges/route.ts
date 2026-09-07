import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { slugify } from '@/lib/utils'
import { isStaff, writeAudit } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const isAuthed = isStaff
const ALLOWED_LEVELS = new Set(['plus_two', 'bachelor', 'master', 'mphil', 'phd', 'diploma', 'certificate'])
function levelsValid(value: unknown) { return Array.isArray(value) && value.length > 0 && value.every(level => ALLOWED_LEVELS.has(String(level))) }

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!levelsValid(body.education_levels)) return NextResponse.json({ error: 'Choose at least one valid post-SEE college level.' }, { status: 400 })
  const supabase = createAdminSupabaseClient()
  const slug = body.slug || slugify(body.name)
  const { data, error } = await supabase
    .from('colleges')
    .insert({ ...body, slug })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('college.create', 'college', data.id, { name: data.name })
  return NextResponse.json(data)
}
