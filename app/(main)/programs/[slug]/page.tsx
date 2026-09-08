import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { BookOpen, Clock, ArrowLeft, Building2, BadgeCheck, BriefcaseBusiness, CircleDollarSign, ExternalLink, GraduationCap } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import type { Program, CollegeProgram, Admission, Scholarship } from '@/types'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

async function getProgram(slug: string) {
  const supabase = createServerSupabaseClient()
  const { data: program } = await supabase.from('programs').select('*').eq('slug', slug).single()
  if (!program) return null

  const { data: colleges } = await supabase
    .from('college_programs')
    .select('*, college:colleges(*)')
    .eq('program_id', program.id)
    .limit(20)

  const collegeIds = (colleges || []).map(item => item.college_id)
  const [{ data: admissions }, { data: scholarships }] = await Promise.all([
    supabase.from('admissions').select('id,title,slug,institution_name,application_deadline,status,programs').eq('status','published').contains('programs',[program.name]).limit(8),
    collegeIds.length ? supabase.from('scholarships').select('*,college:colleges(id,name,slug)').in('college_id',collegeIds).eq('is_active',true).limit(8) : Promise.resolve({ data: [] }),
  ])

  return { program: program as Program, colleges: (colleges || []) as CollegeProgram[], admissions: (admissions || []) as Admission[], scholarships: (scholarships || []) as Scholarship[] }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getProgram(params.slug)
  if (!data) return { title: 'Program Not Found' }
  return {
    title: data.program.name,
    description: data.program.overview?.slice(0, 155) || `Eligibility, fees, colleges, scholarships and admissions for ${data.program.name} in Nepal.`,
    alternates: { canonical: `/programs/${data.program.slug}` },
  }
}

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const data = await getProgram(params.slug)
  if (!data) notFound()

  const { program, colleges, admissions, scholarships } = data
  const fees = colleges.map(item => item.fee).filter((fee): fee is number => fee != null)
  const feeMin = program.average_fee_min ?? (fees.length ? Math.min(...fees) : null)
  const feeMax = program.average_fee_max ?? (fees.length ? Math.max(...fees) : null)
  const pageUrl = absoluteUrl(`/programs/${program.slug}`)
  const jsonLd = { '@context': 'https://schema.org', '@graph': [
    { '@type': 'EducationalOccupationalProgram', '@id': `${pageUrl}#program`, name: program.name, url: pageUrl, description: program.overview || undefined, educationalCredentialAwarded: program.degree_level, occupationalCategory: program.career_paths || [], provider: colleges.slice(0, 10).filter(item => item.college).map(item => ({ '@type': 'CollegeOrUniversity', name: item.college!.name, url: absoluteUrl(`/colleges/${item.college!.slug}`) })) },
    { '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: `${program.name} in Nepal`, dateModified: program.updated_at || program.last_verified_at || program.created_at, mainEntity: { '@id': `${pageUrl}#program` }, citation: program.source_url || undefined, isPartOf: { '@id': `${absoluteUrl('/')}#website` } },
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Programs', path: '/programs' }, { name: program.name, path: `/programs/${program.slug}` }]),
  ] }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <JsonLd data={jsonLd} />
      <Link href="/programs" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Programs
      </Link>

      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{program.name}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue" className="capitalize">{program.degree_level}</Badge>
              <Badge variant="gray">{program.faculty}</Badge>
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Clock className="w-3.5 h-3.5" /> {program.duration}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5"><GraduationCap className="h-5 w-5 text-blue-600"/><h2 className="mt-3 font-bold">Eligibility</h2><p className="mt-2 text-sm leading-6 text-gray-600">{program.eligibility || 'Confirm current eligibility with the awarding university or college.'}</p></div>
        <div className="rounded-2xl border bg-white p-5"><CircleDollarSign className="h-5 w-5 text-emerald-600"/><h2 className="mt-3 font-bold">Typical fee</h2><p className="mt-2 text-sm text-gray-600">{feeMin != null ? `NPR ${feeMin.toLocaleString()}${feeMax && feeMax !== feeMin ? ` – ${feeMax.toLocaleString()}` : ''}` : 'Fees vary by college.'}</p></div>
        <div className="rounded-2xl border bg-white p-5"><BadgeCheck className="h-5 w-5 text-violet-600"/><h2 className="mt-3 font-bold">Entrance</h2><p className="mt-2 text-sm leading-6 text-gray-600">{program.entrance_requirements || 'Check the latest university admission notice.'}</p></div>
      </div>
      {program.overview && <section className="mb-6 rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">About {program.name}</h2><p className="mt-3 whitespace-pre-line leading-7 text-gray-600">{program.overview}</p></section>}
      {(program.curriculum_highlights?.length || program.career_paths?.length) ? <div className="mb-6 grid gap-6 md:grid-cols-2">{program.curriculum_highlights?.length ? <section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5 text-blue-600"/>Curriculum highlights</h2><ul className="mt-4 space-y-2 text-sm text-gray-600">{program.curriculum_highlights.map(item=><li key={item}>• {item}</li>)}</ul></section>:null}{program.career_paths?.length?<section className="rounded-2xl border bg-white p-6"><h2 className="flex items-center gap-2 text-lg font-bold"><BriefcaseBusiness className="h-5 w-5 text-emerald-600"/>Career paths</h2><ul className="mt-4 space-y-2 text-sm text-gray-600">{program.career_paths.map(item=><li key={item}>• {item}</li>)}</ul></section>:null}</div>:null}

      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            Colleges offering {program.name}
          </h2>
          <Badge variant="gray">{colleges.length}</Badge>
        </div>

        {colleges.length > 0 ? (
          <div className="space-y-3">
            {colleges.map((cp) => (
              <Link key={cp.college_id} href={`/colleges/${cp.college?.slug}`} className="group block">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-gray-50 hover:bg-white">
                  <div>
                    <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                      {cp.college?.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{cp.college?.location}</span>
                      {cp.college?.affiliation && (
                        <Badge variant="gray">{cp.college.affiliation}</Badge>
                      )}
                      {cp.scholarship_available && <Badge variant="green">Scholarship</Badge>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {cp.fee && (
                      <p className="font-semibold text-gray-900 text-sm">NPR {cp.fee.toLocaleString()}</p>
                    )}
                    {cp.seats && (
                      <p className="text-xs text-gray-500">{cp.seats} seats</p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No colleges listed for this program yet.</p>
        )}
      </div>
      {admissions.length > 0 && <section className="mt-6 rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Current admissions</h2><div className="mt-4 space-y-3">{admissions.map(item=><Link key={item.id} href={`/admissions/${item.slug}`} className="flex justify-between rounded-xl bg-blue-50 p-4 text-sm"><span><strong>{item.title}</strong><span className="block text-gray-500">{item.institution_name}</span></span><span className="text-blue-700">View →</span></Link>)}</div></section>}
      {scholarships.length > 0 && <section className="mt-6 rounded-2xl border bg-white p-6"><h2 className="text-lg font-bold">Related scholarships</h2><div className="mt-4 grid gap-3 md:grid-cols-2">{scholarships.map(item=><div key={item.id} className="rounded-xl border p-4"><p className="font-semibold">{item.title}</p><p className="mt-1 text-xs text-gray-500">{item.college?.name}</p></div>)}</div></section>}
      {program.source_url && <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm"><p className="font-semibold text-ink">Source and freshness</p><p className="mt-1 text-gray-600">{program.last_verified_at ? `Last checked ${new Date(program.last_verified_at).toLocaleDateString('en-NP', { day: 'numeric', month: 'long', year: 'numeric' })}.` : 'A last-checked date has not been recorded yet.'} Confirm changing requirements on the original source.</p><a href={program.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-700">Official program source <ExternalLink className="h-4 w-4"/></a></div>}
    </div>
  )
}
