import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { COMMUNITY_TOPICS } from '@/lib/community'
import { cleanCommunityText, containsPersonalContact, requestFingerprint } from '@/lib/community-server'

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Community submissions are temporarily unavailable.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  if (body.website) return NextResponse.json({ success: true }, { status: 202 })
  const title = cleanCommunityText(body.title)
  const content = cleanCommunityText(body.body)
  const topic = cleanCommunityText(body.topic)
  if (title.length < 10 || title.length > 120 || content.length < 30 || content.length > 2000) return NextResponse.json({ error: 'Use a 10–120 character title and a 30–2,000 character message.' }, { status: 400 })
  if (!COMMUNITY_TOPICS.some(item => item.value === topic)) return NextResponse.json({ error: 'Choose a valid topic.' }, { status: 400 })
  if (containsPersonalContact(`${title} ${content}`)) return NextResponse.json({ error: 'For safety, remove phone numbers and email addresses.' }, { status: 400 })
  const fingerprint = requestFingerprint(request)
  const db = createAdminSupabaseClient()
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db.from('community_posts').select('id', { count: 'exact', head: true }).eq('fingerprint_hash', fingerprint).gte('created_at', since)
  if ((count || 0) >= 3) return NextResponse.json({ error: 'You have reached the hourly posting limit. Please try later.' }, { status: 429 })
  const { data, error } = await db.from('community_posts').insert({ title, body: content, topic, fingerprint_hash: fingerprint }).select('id').single()
  if (error) return NextResponse.json({ error: 'Could not save this discussion.' }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
