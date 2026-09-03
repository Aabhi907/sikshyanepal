import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

const authed = () => cookies().get('admin_session')?.value === 'authenticated'
const fields: Record<string, string[]> = {
  news: ['title', 'slug', 'content', 'image_url', 'author', 'tags', 'published_date'],
  notice: ['title', 'slug', 'content', 'university_id', 'notice_url', 'published_date'],
  result: ['title', 'slug', 'program', 'semester', 'year', 'university_id', 'result_url', 'published_date'],
}
const tables = { news: 'news', notice: 'notices', result: 'results' } as const

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!authed()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  if (!['reviewing', 'approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const { data: item, error: readError } = await db.from('content_ingestion_items').select('*').eq('id', params.id).single()
  if (readError || !item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 })
  if (['approved', 'rejected'].includes(item.status)) return NextResponse.json({ error: 'This item was already reviewed' }, { status: 409 })

  let publishedId: string | null = null
  if (body.status === 'approved') {
    const allowed = fields[item.target_type]
    const table = tables[item.target_type as keyof typeof tables]
    if (!allowed || !table) return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
    const edited = { ...item.payload, ...(body.payload || {}) }
    const record = Object.fromEntries(allowed.filter((key) => edited[key] !== undefined).map((key) => [key, edited[key]]))
    const { data, error } = await db.from(table).insert(record).select('id').single()
    if (error) return NextResponse.json({ error: `Publish failed: ${error.message}` }, { status: 500 })
    publishedId = data.id
  }
  const { data, error } = await db.from('content_ingestion_items').update({
    status: body.status, reviewer_notes: String(body.reviewer_notes || '').slice(0, 2000) || null,
    reviewed_at: ['approved', 'rejected'].includes(body.status) ? new Date().toISOString() : null,
    reviewed_by: 'SikshyaNepal editor', published_record_id: publishedId,
  }).eq('id', params.id).select().single()
  return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
}
