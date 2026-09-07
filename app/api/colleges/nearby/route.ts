import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

const radians = (value: number) => value * Math.PI / 180
const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => { const radius = 6371; const dLat = radians(lat2 - lat1); const dLng = radians(lng2 - lng1); const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLng / 2) ** 2; return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) }

export async function GET(request: Request) {
  const url = new URL(request.url); const lat = Number(url.searchParams.get('lat')); const lng = Number(url.searchParams.get('lng'))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return NextResponse.json({ error: 'Valid latitude and longitude are required.' }, { status: 400 })
  const { data, error } = await createServerSupabaseClient().from('colleges').select('id,name,slug,location,district,province,affiliation,latitude,longitude,verification_status,education_levels').not('latitude', 'is', null).not('longitude', 'is', null).or('status.eq.active,status.is.null').limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const colleges = (data || []).map(college => ({ ...college, distance_km: distanceKm(lat, lng, Number(college.latitude), Number(college.longitude)) })).sort((a, b) => a.distance_km - b.distance_km).slice(0, 30)
  return NextResponse.json(colleges, { headers: { 'Cache-Control': 'public, max-age=300' } })
}
