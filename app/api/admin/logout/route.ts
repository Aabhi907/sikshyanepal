import { NextResponse } from 'next/server'

export async function POST() {
  const { createAuthClient } = await import('@/lib/auth')
  await createAuthClient().auth.signOut()
  return NextResponse.json({ success: true })
}
