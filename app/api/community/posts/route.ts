import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { COMMUNITY_TOPICS } from '@/lib/community'
import { cleanCommunityText, containsPersonalContact, requestFingerprint } from '@/lib/community-server'
import { randomUUID } from 'crypto'

const MEDIA_TYPES: Record<string, { kind: 'image' | 'video'; extension: string; max: number }> = {
  'image/jpeg': { kind: 'image', extension: 'jpg', max: 5 * 1024 * 1024 },
  'image/png': { kind: 'image', extension: 'png', max: 5 * 1024 * 1024 },
  'image/webp': { kind: 'image', extension: 'webp', max: 5 * 1024 * 1024 },
  'image/gif': { kind: 'image', extension: 'gif', max: 5 * 1024 * 1024 },
  'video/mp4': { kind: 'video', extension: 'mp4', max: 30 * 1024 * 1024 },
  'video/webm': { kind: 'video', extension: 'webm', max: 30 * 1024 * 1024 },
}

export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Community submissions are temporarily unavailable.' }, { status: 503 })
  const body = await request.formData().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid submission.' }, { status: 400 })
  if (body.get('website')) return NextResponse.json({ success: true }, { status: 202 })
  const title = cleanCommunityText(body.get('title'))
  const content = cleanCommunityText(body.get('body'))
  const topic = cleanCommunityText(body.get('topic'))
  const file = body.get('media')
  const media = file instanceof File && file.size > 0 ? file : null
  if (title.length < 10 || title.length > 120 || content.length > 2000 || (!media && content.length < 30)) return NextResponse.json({ error: 'Use a 10–120 character title and at least 30 characters of text, or attach a photo/video.' }, { status: 400 })
  if (!COMMUNITY_TOPICS.some(item => item.value === topic)) return NextResponse.json({ error: 'Choose a valid topic.' }, { status: 400 })
  if (containsPersonalContact(`${title} ${content}`)) return NextResponse.json({ error: 'For safety, remove phone numbers and email addresses.' }, { status: 400 })
  const fingerprint = requestFingerprint(request)
  const db = createAdminSupabaseClient()
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db.from('community_posts').select('id', { count: 'exact', head: true }).eq('fingerprint_hash', fingerprint).gte('created_at', since)
  if ((count || 0) >= 3) return NextResponse.json({ error: 'You have reached the hourly posting limit. Please try later.' }, { status: 429 })
  let mediaUrl: string | null = null
  let mediaType: 'image' | 'video' | null = null
  let storagePath: string | null = null
  if (media) {
    const config = MEDIA_TYPES[media.type]
    if (!config) return NextResponse.json({ error: 'Use JPEG, PNG, WebP, GIF, MP4 or WebM media.' }, { status: 400 })
    if (media.size > config.max) return NextResponse.json({ error: config.kind === 'image' ? 'Images must be 5 MB or smaller.' : 'Videos must be 30 MB or smaller.' }, { status: 400 })
    storagePath = `${fingerprint.slice(0, 12)}/${Date.now()}-${randomUUID()}.${config.extension}`
    const { error: uploadError } = await db.storage.from('community-media').upload(storagePath, Buffer.from(await media.arrayBuffer()), { contentType: media.type, upsert: false })
    if (uploadError) return NextResponse.json({ error: 'Could not upload this media. Confirm the community media migration is installed.' }, { status: 500 })
    mediaUrl = db.storage.from('community-media').getPublicUrl(storagePath).data.publicUrl
    mediaType = config.kind
  }
  const { data, error } = await db.from('community_posts').insert({ title, body: content, topic, fingerprint_hash: fingerprint, media_url: mediaUrl, media_type: mediaType }).select('id').single()
  if (error && storagePath) await db.storage.from('community-media').remove([storagePath])
  if (error) return NextResponse.json({ error: 'Could not save this discussion.' }, { status: 500 })
  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
