import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const now = new Date().toISOString()
  const { data, error } = await createAdminSupabaseClient()
    .from('site_announcements')
    .select('id,title,message,image_url,link_url,link_label,placement,created_at')
    .eq('is_active', true)
    .or(`starts_at.is.null,starts_at.lte.${now}`)
    .or(`ends_at.is.null,ends_at.gt.${now}`)
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Unable to load site announcements:', error.message)
    return NextResponse.json(
      { error: 'Announcements are temporarily unavailable.' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  return NextResponse.json(data ?? [], {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}
