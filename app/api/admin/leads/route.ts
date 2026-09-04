import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(request.url)
  const status     = searchParams.get('status')
  const college_id = searchParams.get('college_id')
  const limit      = Math.min(parseInt(searchParams.get('limit') || '100'), 500)
  const offset     = parseInt(searchParams.get('offset') || '0')

  const supabase = createAdminSupabaseClient()

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (status)     query = query.eq('status', status)
  if (college_id) query = query.eq('college_id', college_id)

  const { data, error, count } = await query

  if (error) {
    console.error('[admin/leads] GET error:', error)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  return NextResponse.json({ leads: data, total: count })
}
