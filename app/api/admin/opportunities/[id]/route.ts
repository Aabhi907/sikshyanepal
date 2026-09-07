import { NextResponse } from 'next/server'
import { isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { is_published } = await request.json()
  if (typeof is_published !== 'boolean') return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  const now = new Date().toISOString()
  const { data, error } = await createAdminSupabaseClient().from('student_opportunities').update({ is_published, is_verified: is_published, last_verified_at: now, updated_at: now }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('opportunity.publish', 'student_opportunity', params.id, { is_published })
  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['owner']))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { error } = await createAdminSupabaseClient().from('student_opportunities').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await writeAudit('opportunity.delete', 'student_opportunity', params.id)
  return NextResponse.json({ success: true })
}
