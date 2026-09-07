import { NextResponse } from 'next/server'
import { createAuthClient, isAdminEmail } from '@/lib/auth'

export async function POST(request: Request) {
  const { email, password } = await request.json()
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  if (!process.env.ADMIN_EMAIL) return NextResponse.json({ error: 'Admin access is not configured.' }, { status: 503 })
  if (!isAdminEmail(email)) return NextResponse.json({ error: 'This email is not authorized for the admin panel.' }, { status: 403 })
  const client = createAuthClient()
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.user) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  const { data: profile } = await client.from('profiles').select('role,status').eq('id', data.user.id).single()
  if (!profile || profile.status !== 'active' || profile.role !== 'owner' || !isAdminEmail(data.user.email)) { await client.auth.signOut(); return NextResponse.json({ error: 'This account does not have owner access.' }, { status: 403 }) }
  return NextResponse.json({ success: true, role: profile.role })
}
