import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.email || !body.password || String(body.password).length < 10 || !body.full_name?.trim()) return NextResponse.json({ error: 'Name, email and a password of at least 10 characters are required.' }, { status: 400 })
  const { data, error } = await createAuthClient().auth.signUp({ email: body.email, password: body.password, options: { data: { full_name: body.full_name.trim() } } })
  if (error) {
    const seconds = Number(error.message.match(/after\s+(\d+)\s+seconds?/i)?.[1] || 0)
    return NextResponse.json(
      { error: seconds ? `Please wait ${seconds} seconds before trying again.` : error.message, retry_after: seconds || undefined },
      { status: error.status === 429 || seconds ? 429 : 400, headers: seconds ? { 'Retry-After': String(seconds) } : undefined },
    )
  }
  return NextResponse.json({ success: true, confirmation_required: !data.session }, { status: 201 })
}
