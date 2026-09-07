import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const isAuthed = isStaff

export async function GET() {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('colleges')
    .select('*')
    .eq('status', 'pending_review')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}
