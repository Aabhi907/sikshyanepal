import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

const isAuthed = isStaff

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body   = await request.json()
  const { status } = body

  const VALID = ['new', 'contacted', 'enrolled', 'rejected']
  if (!VALID.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', params.id)
    .select('id, status')
    .single()

  if (error) {
    console.error('[admin/leads/:id] PATCH error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabaseClient()
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', params.id)

  if (error) {
    console.error('[admin/leads/:id] DELETE error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
