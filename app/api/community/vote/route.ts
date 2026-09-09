import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { cleanCommunityText, recordCommunitySecurityEvent, requestFingerprint } from '@/lib/community-server'
import { getAuthContext, isGoogleAccount } from '@/lib/auth'

export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth || !isGoogleAccount(auth.user)) return NextResponse.json({ error: 'Sign in with Google to vote.' }, { status: 401 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ error: 'Voting is temporarily unavailable.' }, { status: 503 })
  const body = await request.json().catch(() => ({}))
  const targetType = cleanCommunityText(body.target_type)
  const targetId = cleanCommunityText(body.target_id)
  const value = Number(body.value)
  if (!['post', 'comment'].includes(targetType) || !/^[0-9a-f-]{36}$/i.test(targetId) || ![-1, 1].includes(value)) return NextResponse.json({ error: 'Invalid vote.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const fingerprint = requestFingerprint(request)
  const { data, error } = await db.rpc('cast_community_vote', { p_target_type: targetType, p_target_id: targetId, p_fingerprint_hash: `${auth.user.id}:${fingerprint}`, p_value: value })
  if (error) return NextResponse.json({ error: 'Could not save this vote.' }, { status: 500 })
  await recordCommunitySecurityEvent(db, { userId: auth.user.id, action: 'vote', fingerprint, targetId })
  return NextResponse.json({ score: Number(data) || 0 })
}
