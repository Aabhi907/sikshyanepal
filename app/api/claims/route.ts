import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function GET() { const auth = await getAuthContext(); if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 }); const { data, error } = await createAdminSupabaseClient().from('institution_claims').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false }); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data) }
export async function POST(request: Request) {
  const auth = await getAuthContext(); if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await request.json(); if (!['school', 'college'].includes(body.entity_type) || !body.entity_id || !body.institution_name?.trim() || !body.claimant_name?.trim() || !body.claimant_role?.trim() || !/^\S+@\S+\.\S+$/.test(body.official_email || '')) return NextResponse.json({ error: 'Institution, role and a valid official email are required.' }, { status: 400 })
  const row = { user_id: auth.user.id, entity_type: body.entity_type, entity_id: body.entity_id, institution_name: body.institution_name.trim(), claimant_name: body.claimant_name.trim(), claimant_role: body.claimant_role.trim(), official_email: body.official_email.toLowerCase(), official_phone: body.official_phone?.trim() || null, evidence_url: /^https?:\/\//.test(body.evidence_url || '') ? body.evidence_url : null, evidence_notes: body.evidence_notes?.slice(0, 3000) || null }
  const { data, error } = await createAdminSupabaseClient().from('institution_claims').insert(row).select().single(); return error ? NextResponse.json({ error: error.code === '23505' ? 'You already claimed this institution.' : error.message }, { status: error.code === '23505' ? 409 : 500 }) : NextResponse.json(data, { status: 201 })
}
