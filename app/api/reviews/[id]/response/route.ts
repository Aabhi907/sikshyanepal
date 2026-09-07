import { getAuthContext } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in with your approved institution account first.' }, { status: 401 })
  const { response_text } = await request.json()
  const text = String(response_text || '').trim()
  if (text.length < 20 || text.length > 3000) return NextResponse.json({ error: 'Response must be 20 to 3,000 characters.' }, { status: 400 })
  const db = createAdminSupabaseClient()
  const { data: review } = await db.from('reviews').select('college_id').eq('id', params.id).single()
  if (!review) return NextResponse.json({ error: 'Review not found.' }, { status: 404 })
  const { data: membership } = await db.from('institution_memberships').select('id').eq('user_id', auth.user.id).eq('entity_type', 'college').eq('entity_id', review.college_id).maybeSingle()
  if (!membership) return NextResponse.json({ error: 'Only an approved representative of this college can respond.' }, { status: 403 })
  const { data, error } = await db.from('review_responses').insert({ review_id: params.id, college_id: review.college_id, responder_id: auth.user.id, response_text: text }).select().single()
  return error ? NextResponse.json({ error: error.code === '23505' ? 'A response for this review already exists.' : error.message }, { status: error.code === '23505' ? 409 : 500 }) : NextResponse.json(data, { status: 201 })
}
