import { NextResponse } from 'next/server'
import { getAuthContext, isStaff, writeAudit } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const body = await request.json(); if (!['reviewing', 'approved', 'rejected'].includes(body.status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  const db = createAdminSupabaseClient(); const { data: claim } = await db.from('institution_claims').select('*').eq('id', params.id).single(); if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  const auth = await getAuthContext(); if (body.status === 'approved') { const { error } = await db.from('institution_memberships').upsert({ user_id: claim.user_id, entity_type: claim.entity_type, entity_id: claim.entity_id, granted_by: auth?.user.id }, { onConflict: 'user_id,entity_type,entity_id' }); if (error) return NextResponse.json({ error: error.message }, { status: 500 }); await db.from('profiles').update({ role: 'representative', updated_at: new Date().toISOString() }).eq('id', claim.user_id).eq('role', 'user') }
  const update = { status: body.status, reviewer_notes: String(body.reviewer_notes || '').slice(0, 2000) || null, reviewed_by: auth?.user.id, reviewed_at: ['approved', 'rejected'].includes(body.status) ? new Date().toISOString() : null, updated_at: new Date().toISOString() }; const { data, error } = await db.from('institution_claims').update(update).eq('id', params.id).select().single(); if (!error) await writeAudit(`claim.${body.status}`, 'institution_claim', params.id, { institution: claim.institution_name, entity_type: claim.entity_type, entity_id: claim.entity_id }); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data)
}
