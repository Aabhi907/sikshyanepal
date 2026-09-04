import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { isStaff } from '@/lib/auth'

const isAuthed = isStaff

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const supabase = createAdminSupabaseClient()

  const { data, error } = await supabase
    .from('reviews')
    .update(body)
    .eq('id', params.id)
    .select('*, college:colleges(slug)')
    .single()

  if (error) {
    console.error('[admin/reviews/:id] PUT error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Purge Next.js cache for the college profile so approved review appears immediately
  const slug = (data as { college?: { slug?: string } }).college?.slug
  if (slug) revalidatePath(`/colleges/${slug}`)

  return NextResponse.json(data)
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAuthed())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createAdminSupabaseClient()

  // Fetch slug before delete so we can revalidate the page
  const { data: review } = await supabase
    .from('reviews')
    .select('college:colleges(slug)')
    .eq('id', params.id)
    .single()

  const { error } = await supabase.from('reviews').delete().eq('id', params.id)
  if (error) {
    console.error('[admin/reviews/:id] DELETE error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const slug = (review as { college?: { slug?: string } } | null)?.college?.slug
  if (slug) revalidatePath(`/colleges/${slug}`)

  return NextResponse.json({ success: true })
}
