import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  const { data, error } = await createAuthClient().auth.signInWithPassword({ email, password })
  if (error || !data.user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  return NextResponse.json({ success: true })
}
