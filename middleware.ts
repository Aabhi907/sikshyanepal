import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if ((pathname.startsWith('/admin') && pathname !== '/admin/login') || pathname.startsWith('/account/claim')) {
    let response = NextResponse.next({ request })
    const client = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder', { cookies: { getAll: () => request.cookies.getAll(), setAll: values => { values.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); values.forEach(({ name, value, options }) => response.cookies.set(name, value, options)) } } })
    const { data: { user } } = await client.auth.getUser()
    let allowed = Boolean(user)
    if (allowed && pathname.startsWith('/admin')) {
      const { data: profile } = await client.from('profiles').select('role,status').eq('id', user!.id).single()
      allowed = profile?.status === 'active' && ['reviewer', 'editor', 'owner'].includes(profile.role)
    }
    if (!allowed) {
      return NextResponse.redirect(new URL(pathname.startsWith('/admin') ? '/admin/login' : '/account/login', request.url))
    }
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/account/claim'],
}
