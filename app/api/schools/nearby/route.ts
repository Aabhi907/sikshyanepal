import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const latitude = Number(url.searchParams.get('lat'))
  const longitude = Number(url.searchParams.get('lng'))
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < 26 || latitude > 31 || longitude < 80 || longitude > 89) {
    return NextResponse.json({ error: 'Your location must be within Nepal to find nearby schools.' }, { status: 400 })
  }

  const { data, error } = await createServerSupabaseClient().rpc('nearby_active_schools', {
    search_latitude: latitude,
    search_longitude: longitude,
    result_limit: 30,
  })
  if (error) {
    console.error('[nearby-schools] query failed:', error.message)
    return NextResponse.json({ error: 'Nearby school search is temporarily unavailable.' }, { status: 500 })
  }
  return NextResponse.json(data || [], { headers: { 'Cache-Control': 'private, max-age=300' } })
}
