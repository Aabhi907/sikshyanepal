import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend    = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM      = 'SikshyaNepal <onboarding@resend.dev>'
const ADMIN_EMAIL = 'devskiller14@gmail.com'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 200)
}

function inferEducationLevels(programs: string[]): string[] {
  const text = programs.join(' ').toLowerCase()
  const levels = new Set<string>()
  if (text.includes('+2')) levels.add('plus_two')
  if (/\b(bca|bba|mbbs|bsc|bim|bhm|bbs|be|bpharm|bnurs|bachelor)\b/.test(text)) levels.add('bachelor')
  if (/\b(mba|master|msc|ma|med)\b/.test(text)) levels.add('master')
  return Array.from(levels)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // ── Validate required fields ───────────────────────────────────────
    const required = ['name', 'affiliation', 'location', 'submitter_name', 'submitter_role', 'submitter_contact']
    for (const field of required) {
      if (!body[field]?.toString().trim()) {
        return NextResponse.json({ error: `${field} is required` }, { status: 400 })
      }
    }
    if (!body.programs?.length) {
      return NextResponse.json({ error: 'At least one program is required' }, { status: 400 })
    }

    const supabase = createAdminSupabaseClient()

    // ── Duplicate check ────────────────────────────────────────────────
    const { data: existing } = await supabase
      .from('colleges')
      .select('id')
      .ilike('name', body.name.trim())
      .limit(1)

    if (existing?.length) {
      return NextResponse.json(
        { error: 'A college with this name already exists in our database.' },
        { status: 409 },
      )
    }

    // ── Generate unique slug ───────────────────────────────────────────
    const baseSlug = slugify(body.name)
    const affShort = body.affiliation.split(/\s+/)[0].toLowerCase().slice(0, 3)
    const slug     = `${baseSlug}-${affShort}`

    // ── Insert ─────────────────────────────────────────────────────────
    const { data: college, error } = await supabase
      .from('colleges')
      .insert({
        name:              body.name.trim(),
        slug,
        location:          body.location.trim(),
        address:           body.address?.trim()  || null,
        phone:             body.phone?.trim()    || null,
        email:             body.email?.trim()    || null,
        website:           body.website?.trim()  || null,
        description:       body.description?.trim() || null,
        affiliation:       body.affiliation,
        programs_offered:  Array.isArray(body.programs) ? body.programs.join(', ') : '',
        education_levels:  inferEducationLevels(body.programs),
        is_featured:       false,
        status:            'pending_review',
        source:            'public_submission',
        submitted_by:      body.submitter_name.trim(),
        submitter_role:    body.submitter_role,
        submitter_contact: body.submitter_contact.trim(),
      })
      .select()
      .single()

    if (error) {
      console.error('[submit-college] insert error:', error)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // ── Notify admin via email ─────────────────────────────────────────
    if (resend) {
      await resend.emails.send({
        from:    FROM,
        to:      ADMIN_EMAIL,
        subject: `[SikshyaNepal] New college submission: ${body.name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#1847c4;margin:0 0 16px;">New College Submission</h2>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;color:#6b7280;width:140px;">College Name</td>
                  <td style="padding:8px 0;font-weight:600;">${body.name}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Affiliation</td>
                  <td style="padding:8px 0;">${body.affiliation}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Location</td>
                  <td style="padding:8px 0;">${body.location}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Programs</td>
                  <td style="padding:8px 0;">${body.programs?.join(', ') || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Website</td>
                  <td style="padding:8px 0;">${body.website || '—'}</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Phone</td>
                  <td style="padding:8px 0;">${body.phone || '—'}</td></tr>
              <tr style="border-top:1px solid #e5e7eb;">
                  <td style="padding:12px 0 8px;color:#6b7280;">Submitted by</td>
                  <td style="padding:12px 0 8px;font-weight:600;">${body.submitter_name} (${body.submitter_role})</td></tr>
              <tr><td style="padding:8px 0;color:#6b7280;">Contact</td>
                  <td style="padding:8px 0;">${body.submitter_contact}</td></tr>
              ${body.description ? `<tr><td style="padding:8px 0;color:#6b7280;vertical-align:top;">Description</td>
                  <td style="padding:8px 0;">${body.description}</td></tr>` : ''}
            </table>
            <div style="margin-top:24px;">
              <a href="https://sikshyanepal.vercel.app/admin/colleges/pending"
                 style="display:inline-block;padding:10px 20px;background:#1847c4;color:#fff;
                        font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Review in Admin Panel
              </a>
            </div>
          </div>
        `,
      }).catch((e) => console.warn('[submit-college] email failed:', e))
    }

    return NextResponse.json({ success: true, id: college.id })
  } catch (e) {
    console.error('[submit-college] unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
