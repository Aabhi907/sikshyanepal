import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const tables = { syllabus: 'syllabus', question: 'old_questions' } as const
type ResourceKind = keyof typeof tables

function tableFor(kind: string) {
  return kind in tables ? tables[kind as ResourceKind] : null
}

export async function PATCH(request: Request, { params }: { params: { kind: string; id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const table = tableFor(params.kind)
  if (!table) return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 })
  const { is_published } = await request.json()
  if (typeof is_published !== 'boolean') return NextResponse.json({ error: 'Invalid publication status' }, { status: 400 })
  const { data, error } = await createAdminSupabaseClient().from(table).update({ is_published, last_verified_at: new Date().toISOString() }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('study_resource.publish', params.kind, params.id, { is_published })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { kind: string; id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const table = tableFor(params.kind)
  if (!table) return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 })
  const { error } = await createAdminSupabaseClient().from(table).delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('study_resource.delete', params.kind, params.id)
  return NextResponse.json({ success: true })
}
