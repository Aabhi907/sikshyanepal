import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const db = createAdminSupabaseClient()
  const [{ data: posts, error: postError }, { data: comments, error: commentError }, { data: reports, error: reportError }] = await Promise.all([
    db.from('community_posts').select('id,title,body,topic,status,created_at,moderation_note').in('status', ['pending', 'hidden']).order('created_at', { ascending: false }).limit(100),
    db.from('community_comments').select('id,post_id,body,status,created_at,moderation_note,post:community_posts(title)').in('status', ['pending', 'hidden']).order('created_at', { ascending: false }).limit(100),
    db.from('community_reports').select('*').eq('status', 'open').order('created_at', { ascending: false }).limit(100),
  ])
  if (postError || commentError || reportError) return NextResponse.json({ error: postError?.message || commentError?.message || reportError?.message }, { status: 500 })
  return NextResponse.json({ posts: posts || [], comments: comments || [], reports: reports || [] }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(request: Request) {
  if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => ({}))
  const type = body.type
  const id = typeof body.id === 'string' ? body.id : ''
  const status = body.status
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: 'Invalid item.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  if (type === 'report') {
    if (!['resolved', 'dismissed', 'hide-target'].includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
    if (status === 'hide-target') {
      const { data: report } = await db.from('community_reports').select('target_type,target_id').eq('id', id).single()
      if (!report) return NextResponse.json({ error: 'Report not found.' }, { status: 404 })
      const table = report.target_type === 'post' ? 'community_posts' : 'community_comments'
      const { error: hideError } = await db.from(table).update({ status: 'hidden', updated_at: new Date().toISOString() }).eq('id', report.target_id)
      if (hideError) return NextResponse.json({ error: hideError.message }, { status: 500 })
    }
    const resolvedStatus = status === 'hide-target' ? 'resolved' : status
    const { error } = await db.from('community_reports').update({ status: resolvedStatus, resolved_at: new Date().toISOString() }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    if (!['post', 'comment'].includes(type) || !['published', 'rejected', 'hidden'].includes(status)) return NextResponse.json({ error: 'Invalid decision.' }, { status: 400 })
    const table = type === 'post' ? 'community_posts' : 'community_comments'
    const update = { status, published_at: status === 'published' ? new Date().toISOString() : null, moderation_note: typeof body.note === 'string' ? body.note.slice(0, 500) : null, updated_at: new Date().toISOString() }
    const { error } = await db.from(table).update(update).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  revalidatePath('/community')
  revalidatePath('/community/[id]', 'page')
  return NextResponse.json({ success: true })
}
