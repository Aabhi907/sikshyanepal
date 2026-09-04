import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.email || !body.password || String(body.password).length < 10 || !body.full_name?.trim()) return NextResponse.json({ error: 'Name, email and a password of at least 10 characters are required.' }, { status: 400 })
  const { data, error } = await createAuthClient().auth.signUp({ email: body.email, password: body.password, options: { data: { full_name: body.full_name.trim() } } })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true, confirmation_required: !data.session }, { status: 201 })
}
