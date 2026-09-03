import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'

function ics(value: string) { return value.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n') }
function stamp(value: string) { return new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') }

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const { data } = await createServerSupabaseClient().from('admissions').select('id,title,institution_name,application_deadline,source_url,status').eq('id', params.id).eq('status', 'published').single()
  if (!data?.application_deadline) return NextResponse.json({ error: 'Deadline not found.' }, { status: 404 })
  const start = stamp(data.application_deadline)
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//SikshyaNepal//Admissions//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT', `UID:admission-${data.id}@sikshyanepal`, `DTSTAMP:${stamp(new Date().toISOString())}`, `DTSTART:${start}`, `DTEND:${start}`, `SUMMARY:${ics(`Admission deadline: ${data.title}`)}`, `DESCRIPTION:${ics(`${data.institution_name}. Confirm details: ${data.source_url}`)}`, `URL:${data.source_url}`, 'BEGIN:VALARM', 'TRIGGER:-P2D', 'ACTION:DISPLAY', 'DESCRIPTION:Admission deadline in 2 days', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  return new NextResponse(body, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': `attachment; filename="admission-${data.id}.ics"`, 'Cache-Control': 'public, max-age=3600' } })
}

