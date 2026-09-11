import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function POST(request: Request) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!email || !password || email.length > 254 || password.length > 200) return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 })
  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password })
  if (error || !data.user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  return NextResponse.json({ success: true })
}
