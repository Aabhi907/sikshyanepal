import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  const fullName = typeof body.full_name === 'string' ? body.full_name.trim().replace(/\s+/g, ' ') : ''
  if (!email || email.length > 254 || password.length < 10 || password.length > 200 || fullName.length < 2 || fullName.length > 80) return NextResponse.json({ error: 'Enter a valid name, email and password of at least 10 characters.' }, { status: 400 })
  const { data, error } = await createAuthClient().auth.signUp({ email, password, options: { data: { full_name: fullName } } })
  if (error) {
    const seconds = Number(error.message.match(/after\s+(\d+)\s+seconds?/i)?.[1] || 0)
    return NextResponse.json(
      { error: seconds ? `Please wait ${seconds} seconds before trying again.` : error.message, retry_after: seconds || undefined },
      { status: error.status === 429 || seconds ? 429 : 400, headers: seconds ? { 'Retry-After': String(seconds) } : undefined },
    )
  }
  return NextResponse.json({ success: true, confirmation_required: !data.session }, { status: 201 })
}
