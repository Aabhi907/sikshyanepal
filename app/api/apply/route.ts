import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
import { Resend } from 'resend'

const resend      = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM        = 'SikshyaNepal <onboarding@resend.dev>'
const ADMIN_EMAIL = 'devskiller14@gmail.com'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { college_id, college_name, name, phone, email, program, message } = body

    // ── Validate required fields ───────────────────────────────────────
    if (!name?.trim())      return NextResponse.json({ error: 'Name is required' },    { status: 400 })
    if (!phone?.trim())     return NextResponse.json({ error: 'Phone is required' },   { status: 400 })
    if (!program?.trim())   return NextResponse.json({ error: 'Program is required' }, { status: 400 })
    if (!college_id)        return NextResponse.json({ error: 'College ID missing' },  { status: 400 })

    const supabase = createAdminSupabaseClient()

    // ── Insert lead ────────────────────────────────────────────────────
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        college_id,
        college_name: college_name?.trim() ?? '',
        student_name:  name.trim(),
        student_email: email?.trim()   || null,
        student_phone: phone.trim(),
        program_interest: program.trim(),
        message:       message?.trim() || null,
        status:        'new',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[apply] insert error:', error)
      return NextResponse.json({ error: 'Database error. Please try again.' }, { status: 500 })
    }

    // ── Notify admin ───────────────────────────────────────────────────
    if (resend) {
      await resend.emails.send({
        from:    FROM,
        to:      ADMIN_EMAIL,
        subject: `New Application — ${college_name}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;">
            <h2 style="color:#1847c4;margin:0 0 4px;">New College Application</h2>
            <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">A student just applied via SikshyaNepal</p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;width:140px;">College</td>
                <td style="padding:10px 0;font-weight:600;">${college_name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Student Name</td>
                <td style="padding:10px 0;font-weight:600;">${name}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Phone</td>
                <td style="padding:10px 0;font-weight:600;color:#1847c4;">${phone}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Email</td>
                <td style="padding:10px 0;">${email || '—'}</td>
              </tr>
              <tr style="border-bottom:1px solid #f0f0f0;">
                <td style="padding:10px 0;color:#6b7280;">Program</td>
                <td style="padding:10px 0;">${program}</td>
              </tr>
              ${message ? `<tr>
                <td style="padding:10px 0;color:#6b7280;vertical-align:top;">Message</td>
                <td style="padding:10px 0;">${message}</td>
              </tr>` : ''}
            </table>
            <div style="margin-top:24px;">
              <a href="https://sikshyanepal.vercel.app/admin/leads"
                 style="display:inline-block;padding:10px 20px;background:#1847c4;color:#fff;
                        font-size:14px;font-weight:600;text-decoration:none;border-radius:8px;">
                Review in Admin Panel
              </a>
            </div>
          </div>
        `,
      }).catch(e => console.warn('[apply] admin email failed:', e))
    }

    return NextResponse.json({ success: true, id: lead.id })
  } catch (e) {
    console.error('[apply] unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected error. Please try again.' }, { status: 500 })
  }
}
