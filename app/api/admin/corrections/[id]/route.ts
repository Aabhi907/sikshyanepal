import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const isAuthed = isStaff

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!['pending', 'reviewing', 'accepted', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  const { data, error } = await createAdminSupabaseClient().from('data_corrections').update({ status: body.status, resolution_notes: typeof body.resolution_notes === 'string' ? body.resolution_notes.slice(0, 2000) : null, reviewed_at: ['accepted', 'rejected'].includes(body.status) ? new Date().toISOString() : null }).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
