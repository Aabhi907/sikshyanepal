import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const typeValid = (value: unknown): value is 'school' | 'college' => value === 'school' || value === 'college'
const clean = (value: unknown, max: number) => typeof value === 'string' ? value.trim().slice(0, max) : ''

export async function GET() {
  const auth = await getAuthContext(); if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const db = createAdminSupabaseClient(); const { data, error } = await db.from('institution_memberships').select('id,entity_type,entity_id,role,created_at').eq('user_id', auth.user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const memberships = data || []; const schoolIds = memberships.filter((item) => item.entity_type === 'school').map((item) => item.entity_id); const collegeIds = memberships.filter((item) => item.entity_type === 'college').map((item) => item.entity_id)
  const [{ data: schools }, { data: colleges }] = await Promise.all([schoolIds.length ? db.from('schools').select('id,name,slug,district,province,verification_status').in('id', schoolIds) : Promise.resolve({ data: [] }), collegeIds.length ? db.from('colleges').select('id,name,slug,location,verification_status').in('id', collegeIds) : Promise.resolve({ data: [] })])
  const byId = new Map([...(schools || []), ...(colleges || [])].map((item) => [item.id, item]))
  return NextResponse.json(memberships.map((membership) => ({ ...membership, institution: byId.get(membership.entity_id) || null })))
}

export async function POST(request: Request) {
  const auth = await getAuthContext(); if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  try {
    const body = await request.json(); if (!typeValid(body.entity_type) || !/^[0-9a-f-]{36}$/i.test(clean(body.entity_id, 50))) return NextResponse.json({ error: 'Invalid institution.' }, { status: 400 })
    const details = clean(body.details, 4000); const sourceUrl = clean(body.source_url, 1000)
    if (details.length < 20) return NextResponse.json({ error: 'Please provide at least 20 characters explaining the proposed update.' }, { status: 400 })
    if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) return NextResponse.json({ error: 'Supporting source must be a valid web address.' }, { status: 400 })
    const db = createAdminSupabaseClient(); const { data: membership } = await db.from('institution_memberships').select('id').eq('user_id', auth.user.id).eq('entity_type', body.entity_type).eq('entity_id', body.entity_id).maybeSingle()
    if (!membership) return NextResponse.json({ error: 'You are not an approved representative for this institution.' }, { status: 403 })
    const table = body.entity_type === 'school' ? 'schools' : 'colleges'; const { data: institution } = await db.from(table).select('name').eq('id', body.entity_id).single(); if (!institution) return NextResponse.json({ error: 'Institution not found.' }, { status: 404 })
    const { error } = await db.from('data_corrections').insert({ entity_type: body.entity_type, entity_id: body.entity_id, entity_name: institution.name, correction_type: 'other', details, source_url: sourceUrl || null, reporter_name: auth.profile.full_name || auth.user.email || 'Institution representative', reporter_email: auth.user.email || 'representative@invalid.local', reporter_role: 'Approved institution representative', status: 'pending' })
    return error ? NextResponse.json({ error: 'Could not submit the update request.' }, { status: 500 }) : NextResponse.json({ success: true }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
}
