import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'

function safeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/my-path'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeNext(url.searchParams.get('next'))

  if (!code) {
    return NextResponse.redirect(new URL('/account/login?error=google_callback_failed', url.origin))
  }

  const { error } = await createAuthClient().auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/account/login?error=google_sign_in_failed', url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
