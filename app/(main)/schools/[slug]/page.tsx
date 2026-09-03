import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BookOpen, Building2, CalendarDays, ExternalLink, GraduationCap, Mail, MapPin, Phone, School as SchoolIcon, ShieldCheck, Users } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import VerificationBadge from '@/components/institutions/VerificationBadge'
import ReportCorrectionForm from '@/components/institutions/ReportCorrectionForm'
import type { School } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getSchool(slug: string) {
  const { data } = await createServerSupabaseClient().from('schools').select('*').eq('slug', slug).eq('status', 'active').single()
  return data as School | null
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const school = await getSchool(params.slug)
  if (!school) return { title: 'School not found' }
  const place = [school.local_level, school.district, school.province].filter(Boolean).join(', ')
  return {
    title: `${school.name} – Programs, Contact and School Information`,
    description: `Verified information about ${school.name} in ${place}: grades, contact details, facilities and official sources.`,
    alternates: { canonical: `/schools/${school.slug}` },
  }
}

function displayValue(value: string | number | null | undefined) {
  return value == null || value === '' ? 'Not yet available' : String(value)
}

export default async function SchoolProfilePage({ params }: { params: { slug: string } }) {
  const school = await getSchool(params.slug)
  if (!school) notFound()
  const address = [school.address || school.location, school.local_level, school.ward_number ? `Ward ${school.ward_number}` : null, school.district, school.province].filter(Boolean).join(', ')
  const gradeRange = school.grades_from != null && school.grades_to != null ? `${school.grades_from === 0 ? 'ECD' : `Grade ${school.grades_from}`} to Grade ${school.grades_to}` : null
  const verifiedDate = school.last_verified_at ? new Date(school.last_verified_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' }) : null
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'School',
    name: school.name,
    url: `https://sikshyanepal.vercel.app/schools/${school.slug}`,
    identifier: school.iemis_code || undefined,
    address: { '@type': 'PostalAddress', streetAddress: school.address || undefined, addressLocality: school.local_level || school.location || undefined, addressRegion: school.province, addressCountry: 'NP' },
    telephone: school.phone || undefined,
    email: school.email || undefined,
    sameAs: school.website ? [school.website] : undefined,
  }

  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className="bg-[#0d1b3e] text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <nav className="mb-7 flex items-center gap-2 text-xs text-blue-200"><Link href="/schools" className="hover:text-white">Schools</Link><span>/</span><span className="truncate text-white/70">{school.name}</span></nav>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10"><SchoolIcon className="h-9 w-9 text-blue-200" /></div>
            <div className="min-w-0"><VerificationBadge status={school.verification_status} /><h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{school.name}</h1><p className="mt-3 flex items-start gap-2 text-sm text-blue-100/75"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />{address}</p></div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_340px] lg:px-8">
        <main className="space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-ink">About this school</h2><p className="mt-4 whitespace-pre-line text-sm leading-7 text-gray-600">{school.description || `${school.name} is listed in the SikshyaNepal school directory. We are progressively adding verified academic, facility and admission information from official sources.`}</p></section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-ink">Academic information</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[
              { Icon: BookOpen, label: 'Grades offered', value: gradeRange },
              { Icon: GraduationCap, label: 'School level', value: school.school_level?.replaceAll('_', ' ') },
              { Icon: Building2, label: 'Ownership', value: school.ownership_type === 'institutional' ? 'Private / Institutional' : school.ownership_type },
              { Icon: CalendarDays, label: 'Established', value: school.established_year },
            ].map(({ Icon, label, value }) => <div key={label} className="rounded-xl border border-gray-100 bg-gray-50 p-4"><Icon className="mb-3 h-5 w-5 text-primary" /><dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</dt><dd className="mt-1 text-sm font-bold capitalize text-ink">{displayValue(value)}</dd></div>)}
          </div>
          {school.streams?.length ? <div className="mt-6"><h3 className="text-sm font-bold text-ink">Programs and streams</h3><div className="mt-3 flex flex-wrap gap-2">{school.streams.map((item) => <span key={item} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary">{item}</span>)}</div></div> : null}
          </section>

          {school.facilities?.length ? <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-ink">Facilities</h2><div className="mt-4 grid gap-3 sm:grid-cols-2">{school.facilities.map((facility) => <div key={facility} className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-sm font-medium text-gray-700"><ShieldCheck className="h-4 w-4 text-emerald-500" />{facility}</div>)}</div></section> : null}

          <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-bold text-ink">Source and verification</h2><p className="mt-1 text-sm text-gray-500">See where this information came from.</p></div><VerificationBadge status={school.verification_status} /></div><dl className="mt-5 divide-y divide-gray-100 text-sm"><div className="flex justify-between gap-4 py-3"><dt className="text-gray-500">Source</dt><dd className="text-right font-semibold text-ink">{school.source_name || 'Not yet documented'}</dd></div><div className="flex justify-between gap-4 py-3"><dt className="text-gray-500">Last verified</dt><dd className="text-right font-semibold text-ink">{verifiedDate || 'Verification pending'}</dd></div>{school.source_url && <div className="flex justify-between gap-4 py-3"><dt className="text-gray-500">Evidence</dt><dd><a href={school.source_url} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 font-semibold text-primary">Open original source <ExternalLink className="h-3.5 w-3.5" /></a></dd></div>}</dl><div className="mt-5 border-t border-gray-100 pt-5"><ReportCorrectionForm entityType="school" entityId={school.id} entityName={school.name} /></div></section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Quick information</h2><dl className="mt-4 space-y-4 text-sm">{school.iemis_code && <div><dt className="text-xs text-gray-400">IEMIS code</dt><dd className="mt-1 font-mono font-semibold text-ink">{school.iemis_code}</dd></div>}<div><dt className="text-xs text-gray-400">Location</dt><dd className="mt-1 font-semibold text-ink">{address}</dd></div>{school.principal_name && <div><dt className="text-xs text-gray-400">Principal</dt><dd className="mt-1 font-semibold text-ink">{school.principal_name}</dd></div>}{school.medium_of_instruction?.length ? <div><dt className="text-xs text-gray-400">Medium</dt><dd className="mt-1 font-semibold text-ink">{school.medium_of_instruction.join(', ')}</dd></div> : null}</dl></section>
          <section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Contact school</h2><div className="mt-4 space-y-2">{school.phone && <a href={`tel:${school.phone}`} className="flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white"><Phone className="h-4 w-4" />{school.phone}</a>}{school.email && <a href={`mailto:${school.email}`} className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-ink"><Mail className="h-4 w-4 text-primary" />Email school</a>}{school.website && <a href={school.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-ink"><ExternalLink className="h-4 w-4 text-primary" />Official website</a>}</div>{!school.phone && !school.email && !school.website && <p className="mt-3 text-sm leading-relaxed text-gray-500">Verified contact details have not been added yet. You can report official details using the correction form.</p>}</section>
          {(school.student_count != null || school.teacher_count != null) && <section className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">School community</h2><div className="mt-4 grid grid-cols-2 gap-3">{school.student_count != null && <div className="rounded-xl bg-blue-50 p-3"><Users className="h-4 w-4 text-primary" /><p className="mt-2 font-mono text-xl font-bold text-ink">{school.student_count.toLocaleString()}</p><p className="text-xs text-gray-500">Students</p></div>}{school.teacher_count != null && <div className="rounded-xl bg-emerald-50 p-3"><GraduationCap className="h-4 w-4 text-emerald-600" /><p className="mt-2 font-mono text-xl font-bold text-ink">{school.teacher_count.toLocaleString()}</p><p className="text-xs text-gray-500">Teachers</p></div>}</div></section>}
        </aside>
      </div>
    </div>
  )
}
