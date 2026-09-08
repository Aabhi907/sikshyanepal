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
  return email.test(text) || phone.test(text)
}

export function cleanCommunityText(value: unknown) {
  return typeof value === 'string' ? value.replace(/\0/g, '').replace(/\r\n/g, '\n').trim() : ''
}
