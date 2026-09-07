import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('entrance_exams').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('entrance_exam.delete', 'entrance_exam', params.id)
  return NextResponse.json({ success: true })
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { status } = await request.json()
  if (!['draft', 'published', 'closed'].includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  const { data, error } = await createAdminSupabaseClient().from('entrance_exams').update({ status, updated_at: new Date().toISOString() }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('entrance_exam.status', 'entrance_exam', params.id, { status })
  return NextResponse.json(data)
}
