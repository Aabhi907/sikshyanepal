import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanCommunityText, containsPersonalContact, requestFingerprint } from '@/lib/community-server'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Community replies are temporarily unavailable.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  if (body.website) return NextResponse.json({ success: true }, { status: 202 })
  const content = cleanCommunityText(body.body)
  if (content.length < 2 || content.length > 1000) return NextResponse.json({ error: 'Replies must be between 2 and 1,000 characters.' }, { status: 400 })
  if (containsPersonalContact(content)) return NextResponse.json({ error: 'For safety, remove phone numbers and email addresses.' }, { status: 400 })
  const fingerprint = requestFingerprint(request)
  const db = createAdminSupabaseClient()
  const { data: post } = await db.from('community_posts').select('id').eq('id', params.id).eq('status', 'published').single()
  if (!post) return NextResponse.json({ error: 'Discussion not found.' }, { status: 404 })
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db.from('community_comments').select('id', { count: 'exact', head: true }).eq('fingerprint_hash', fingerprint).gte('created_at', since)
  if ((count || 0) >= 8) return NextResponse.json({ error: 'You have reached the hourly reply limit. Please try later.' }, { status: 429 })
  const { error } = await db.from('community_comments').insert({ post_id: params.id, body: content, fingerprint_hash: fingerprint })
  if (error) return NextResponse.json({ error: 'Could not save this reply.' }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
