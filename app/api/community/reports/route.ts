import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanCommunityText, requestFingerprint } from '@/lib/community-server'

const REASONS = ['personal-information', 'bullying', 'spam', 'unsafe-advice', 'false-information', 'other']
export async function POST(request: Request) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Reporting is temporarily unavailable.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  const targetType = cleanCommunityText(body.target_type)
  const targetId = cleanCommunityText(body.target_id)
  const reason = cleanCommunityText(body.reason)
  const details = cleanCommunityText(body.details).slice(0, 500) || null
  if (!['post', 'comment'].includes(targetType) || !/^[0-9a-f-]{36}$/i.test(targetId) || !REASONS.includes(reason)) return NextResponse.json({ error: 'Invalid report.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const fingerprint = requestFingerprint(request)
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await db.from('community_reports').select('id', { count: 'exact', head: true }).eq('fingerprint_hash', fingerprint).gte('created_at', since)
  if ((count || 0) >= 10) return NextResponse.json({ error: 'You have reached the hourly reporting limit.' }, { status: 429 })
  const { error } = await db.from('community_reports').insert({ target_type: targetType, target_id: targetId, reason, details, fingerprint_hash: fingerprint })
  if (error) return NextResponse.json({ error: 'Could not save this report.' }, { status: 500 })
  return NextResponse.json({ success: true }, { status: 201 })
}
