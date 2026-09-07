import type { Metadata } from 'next'
import Link from 'next/link'
import { Building2, Database, MapPinned, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import SchoolCard from '@/components/schools/SchoolCard'
import SchoolFilters, { type SchoolSearchParams } from '@/components/schools/SchoolFilters'
import type { School } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Schools in Nepal – Find and Compare Verified Schools',
  description: 'Search Nepal schools offering ECD through Grade 10 by district, level and ownership. View sourced profiles, contact details and facilities.',
  alternates: { canonical: '/schools' },
}

async function getSchools(sp: SchoolSearchParams) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('schools').select('*').eq('status', 'active').or('grades_to.lte.10,grades_to.is.null').order('is_featured', { ascending: false }).order('name').limit(500)
  if (sp.q) query = query.ilike('name', `%${sp.q}%`)
  if (sp.province) query = query.eq('province', sp.province)
  if (sp.district) query = query.eq('district', sp.district)
  if (sp.ownership) query = query.eq('ownership_type', sp.ownership)
  if (sp.level) query = query.eq('school_level', sp.level)
  if (sp.medium) query = query.contains('medium_of_instruction', [sp.medium])
  const grade = Number(sp.grade)
  if (sp.grade !== undefined && Number.isInteger(grade) && grade >= 0 && grade <= 10) {
    query = query.or(`grades_from.lte.${grade},grades_from.is.null`).or(`grades_to.gte.${grade},grades_to.is.null`)
  }
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])
  const { data, error } = await query
  if (error) console.error('[schools] query failed:', error.message)
  return (data || []) as School[]
}

async function getDistricts(province?: string) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('schools').select('district').eq('status', 'active').or('grades_to.lte.10,grades_to.is.null').order('district').limit(5000)
  if (province) query = query.eq('province', province)
  const { data } = await query
  return Array.from(new Set((data || []).map((row) => row.district).filter(Boolean))) as string[]
}

export default async function SchoolsPage({ searchParams }: { searchParams: SchoolSearchParams }) {
  const [schools, districts] = await Promise.all([getSchools(searchParams), getDistricts(searchParams.province)])
  const verifiedCount = schools.filter((s) => s.verification_status !== 'unverified').length

  return (
    <div className="min-h-screen bg-[#f0f4ff]">
      <section className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary"><Building2 className="h-4 w-4" />Nepal school directory</div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Find the right school, with facts you can check.</h1>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-gray-500">Explore ECD to Grade 10 schools by province, district, level and ownership. For +2, Bachelor or Master study, use the Colleges directory.</p>
            </div>
            <Link href="/schools#data-quality" className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-primary"><ShieldCheck className="h-4 w-4" />How verification works</Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[['Profiles found', schools.length.toLocaleString(), Database], ['Verified results', verifiedCount.toLocaleString(), ShieldCheck], ['Districts', new Set(schools.map((s) => s.district)).size.toLocaleString(), MapPinned], ['Provinces', new Set(schools.map((s) => s.province)).size.toLocaleString(), Building2]].map(([label, value, Icon]) => (
            <div key={String(label)} className="rounded-2xl border border-gray-200 bg-white p-4"><Icon className="mb-3 h-5 w-5 text-primary" /><p className="font-mono text-2xl font-extrabold text-ink">{String(value)}</p><p className="mt-1 text-xs font-medium text-gray-500">{String(label)}</p></div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <SchoolFilters searchParams={searchParams} districts={districts} resultCount={schools.length} />
          <main>
            <div className="mb-4 flex items-center justify-between gap-4"><p className="text-sm text-gray-500"><strong className="text-ink">{schools.length.toLocaleString()}</strong> matching school{schools.length === 1 ? '' : 's'}</p></div>
            {schools.length ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{schools.map((school) => <SchoolCard key={school.id} school={school} />)}</div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center"><Building2 className="mx-auto h-10 w-10 text-gray-300" /><h2 className="mt-4 font-display text-xl font-bold text-ink">No schools match these filters</h2><p className="mt-2 text-sm text-gray-500">Try a broader location or clear the filters.</p><Link href="/schools" className="mt-5 inline-block rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">View all schools</Link></div>
            )}
          </main>
        </div>

        <section id="data-quality" className="mt-12 rounded-3xl bg-[#0d1b3e] p-7 text-white sm:p-10">
          <div className="grid gap-8 md:grid-cols-3"><div><ShieldCheck className="mb-4 h-7 w-7 text-blue-300" /><h2 className="font-display text-xl font-bold">Verification you can see</h2><p className="mt-2 text-sm leading-relaxed text-blue-100/70">Source-verified profiles link to the dataset or official page used. Institution-verified profiles were additionally confirmed by an authorized representative.</p></div><div><h3 className="font-bold">Our source order</h3><ol className="mt-3 space-y-2 text-sm text-blue-100/70"><li>1. Government and IEMIS datasets</li><li>2. Official school publications</li><li>3. Institution-confirmed submissions</li></ol></div><div><h3 className="font-bold">Information changes</h3><p className="mt-3 text-sm leading-relaxed text-blue-100/70">Every profile includes a correction form. Reports enter a review queue and are checked before publication.</p></div></div>
        </section>
      </div>
    </div>
  )
}
