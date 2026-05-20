import { NextRequest, NextResponse } from 'next/server'
import { sendResultNotification } from '@/lib/email'
import type { Result } from '@/types'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { results?: Result[]; secret?: string }

    // Validate secret
    const secret = process.env.NOTIFICATION_SECRET
    if (!secret || body.secret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const results = body.results ?? []
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: 'No results provided' }, { status: 400 })
    }

    const { sent, errors } = await sendResultNotification(results)
    return NextResponse.json({ sent, errors })
  } catch (e) {
    console.error('[notify-subscribers]', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
