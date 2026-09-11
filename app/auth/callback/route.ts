import { NextResponse } from 'next/server'
import { createAuthClient } from '@/lib/auth'
import { safeNextPath } from '@/lib/safe-next'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const next = safeNextPath(url.searchParams.get('next'), '/my-path')

  if (!code) {
    return NextResponse.redirect(new URL('/account/login?error=google_callback_failed', url.origin))
  }

  const { error } = await createAuthClient().auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(new URL('/account/login?error=google_sign_in_failed', url.origin))
  }

  return NextResponse.redirect(new URL(next, url.origin))
}
