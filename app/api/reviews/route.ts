import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { getAuthContext } from '@/lib/auth'

export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in before submitting a review.' }, { status: 401 })
  const body = await request.json()
  const { college_id, student_name, program, year, rating, review_text, evidence_url } = body

  if (!college_id || !student_name || !review_text || !rating) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
  }
  if (review_text.length < 20) {
    return NextResponse.json({ error: 'Review must be at least 20 characters' }, { status: 400 })
  }
  const categoryFields = ['teaching_rating', 'facilities_rating', 'administration_rating', 'value_rating', 'placement_rating', 'attendance_rating', 'safety_rating', 'internship_support_rating']
  for (const field of categoryFields) if (body[field] != null && Number(body[field]) !== 0 && (Number(body[field]) < 1 || Number(body[field]) > 5)) return NextResponse.json({ error: `${field} must be between 1 and 5` }, { status: 400 })
  if (evidence_url && !/^https:\/\//i.test(evidence_url)) return NextResponse.json({ error: 'Evidence URL must use HTTPS.' }, { status: 400 })

  const supabase = createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('reviews')
    .insert({ college_id, student_name, program, year: year || null, rating, review_text, is_approved: false, author_id: auth.user.id, teaching_rating: body.teaching_rating || null, facilities_rating: body.facilities_rating || null, administration_rating: body.administration_rating || null, value_rating: body.value_rating || null, placement_rating: body.placement_rating || null, attendance_rating: body.attendance_rating || null, safety_rating: body.safety_rating || null, internship_support_rating: body.internship_support_rating || null, hidden_costs_reported: Boolean(body.hidden_costs_reported), hostel_transport_note: body.hostel_transport_note?.trim().slice(0, 300) || null, verification_status: evidence_url ? 'submitted' : 'unverified' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (evidence_url) {
    const { error: evidenceError } = await supabase.from('review_verifications').insert({ review_id: data.id, evidence_url })
    if (evidenceError) return NextResponse.json({ error: 'Review was saved, but private verification evidence could not be saved. Please contact support.' }, { status: 500 })
  }
  return NextResponse.json({ success: true, id: data.id })
}
