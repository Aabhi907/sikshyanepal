import { createHash } from 'crypto'

export function requestFingerprint(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const agent = request.headers.get('user-agent') || 'unknown'
  const salt = process.env.COMMUNITY_HASH_SALT || process.env.ADMIN_EMAIL || 'sikshyanepal-community'
  return createHash('sha256').update(`${salt}:${forwarded}:${agent}`).digest('hex')
}

export function containsPersonalContact(text: string) {
  const email = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
  const phone = /(?:\+?977[-\s]?)?(?:9[678]\d[-\s]?\d{7}|0?1[-\s]?\d{7})/
  const socialHandle = /(?:^|\s)@[a-z0-9_.]{3,30}\b/i
  const preciseLocation = /\b(?:room|house|flat|hostel room)\s*(?:no\.?|number|#)?\s*[a-z0-9-]{1,10}\b/i
  return email.test(text) || phone.test(text) || socialHandle.test(text) || preciseLocation.test(text)
}

export function cleanCommunityText(value: unknown) {
  return typeof value === 'string' ? value.replace(/\0/g, '').replace(/\r\n/g, '\n').trim() : ''
}

export function cleanPublicAlias(value: unknown) {
  return typeof value === 'string' ? value.trim() : ''
}

export function validPublicAlias(alias: string) {
  return /^[A-Za-z0-9_]{3,24}$/.test(alias)
}

export async function recordCommunitySecurityEvent(
  db: ReturnType<typeof import('@/lib/supabase').createAdminSupabaseClient>,
  values: { userId: string; action: 'post' | 'comment' | 'report' | 'vote' | 'delete' | 'appeal'; fingerprint: string; targetId?: string },
) {
  await db.from('community_security_events').insert({
    user_id: values.userId,
    action: values.action,
    target_id: values.targetId || null,
    fingerprint_hash: values.fingerprint,
  })
}
