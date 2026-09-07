import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

function clean(value: unknown, max: number) { return typeof value === 'string' ? value.trim().slice(0, max) : '' }
function slugify(name: string) { return name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 190) }

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (clean(body.website, 500)) return NextResponse.json({ success: true })
    const required = ['name', 'province', 'district', 'school_level', 'submitter_name', 'submitter_role', 'submitter_contact']
    for (const field of required) if (!clean(body[field], 300)) return NextResponse.json({ error: `${field.replaceAll('_', ' ')} is required.` }, { status: 400 })
    const gradesFrom = Number(body.grades_from); const gradesTo = Number(body.grades_to)
    if (!Number.isInteger(gradesFrom) || !Number.isInteger(gradesTo) || gradesFrom < 0 || gradesTo > 10 || gradesFrom > gradesTo) return NextResponse.json({ error: 'Choose a valid grade range from ECD through Grade 10.' }, { status: 400 })
    const website = clean(body.official_website, 500)
    if (website && !/^https?:\/\//i.test(website)) return NextResponse.json({ error: 'Official website must start with http:// or https://.' }, { status: 400 })
    const db = createAdminSupabaseClient(); const name = clean(body.name, 220)
    const { data: existing } = await db.from('schools').select('id').ilike('name', name).limit(1)
    if (existing?.length) return NextResponse.json({ error: 'A school with this name is already in the directory. Please use its profile to report a correction or claim it.' }, { status: 409 })
    const { data, error } = await db.from('schools').insert({
      name, slug: `${slugify(name)}-${Date.now().toString(36)}`, province: clean(body.province, 80), district: clean(body.district, 100), local_level: clean(body.local_level, 120) || null,
      address: clean(body.address, 300) || null, location: clean(body.local_level, 120) || clean(body.district, 100), ownership_type: clean(body.ownership_type, 30) || 'other', school_level: clean(body.school_level, 30), grades_from: gradesFrom, grades_to: gradesTo,
      medium_of_instruction: Array.isArray(body.mediums) ? body.mediums.filter((item: unknown) => typeof item === 'string').slice(0, 3) : [], phone: clean(body.phone, 80) || null, email: clean(body.email, 254).toLowerCase() || null, website: website || null,
      description: clean(body.description, 3000) || null, source_name: 'Public submission', source_url: website || null, status: 'pending_review', verification_status: 'unverified', submitted_by: clean(body.submitter_name, 120), submitter_role: clean(body.submitter_role, 80), submitter_contact: clean(body.submitter_contact, 254),
    }).select('id').single()
    if (error) return NextResponse.json({ error: 'Could not save the submission. Please try again.' }, { status: 500 })
    return NextResponse.json({ success: true, id: data.id }, { status: 201 })
  } catch { return NextResponse.json({ error: 'Invalid request.' }, { status: 400 }) }
}
