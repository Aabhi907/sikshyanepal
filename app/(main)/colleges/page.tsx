import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeCard from '@/components/colleges/CollegeCard'
import CollegeFilters from '@/components/colleges/CollegeFilters'
import SearchBar from '@/components/ui/SearchBar'
import type { College, CollegeProgram, Review } from '@/types'
import { AlertCircle, Building2 } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'
import JsonLd from '@/components/seo/JsonLd'
import { absoluteUrl, breadcrumbSchema } from '@/lib/seo'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '+2, Bachelor and Master Colleges in Nepal',
  description: 'Browse Nepal colleges for +2, Bachelor, Master, diploma and higher education. Filter by location, affiliation, faculty and level.',
  alternates: { canonical: '/colleges' },
}

// Extended type with server-computed fields the card needs
type RichCollege = College & {
  avg_rating?:   number
  review_count?: number
  fee_min?:      number
  fee_max?:      number
}

const directoryAnswers = [
  {
    question: 'What study levels are included in the Nepal college directory?',
    answer: 'The directory covers post-SEE education: +2, Bachelor, Master, diploma, certificate and other higher-education programmes. Use the level filter to narrow the listings.',
  },
  {
    question: 'How should I compare colleges in Nepal?',
    answer: 'Start with programme availability and affiliation, then compare location, published fees, scholarships, admission requirements and student reviews. Confirm changing details with the college before applying.',
  },
  {
    question: 'Does SikshyaNepal verify every college listing?',
    answer: 'Verification status is shown on individual college profiles. A source-verified profile links to documented source information; an unverified profile should be treated as a starting point and checked directly with the institution.',
  },
]

async function getColleges(sp: {
  q?:           string
  location?:    string
  affiliation?: string
  faculty?:     string
  level?:       string
  province?: string
  district?: string
  maxFee?: string
  scholarship?: string
  verified?: string
  program?: string
}): Promise<{ all: RichCollege[]; filtered: RichCollege[]; loadError: boolean }> {
  const supabase = createServerSupabaseClient()

  let query = supabase
    .from('colleges')
    .select(`
      *,
      programs:college_programs(
        fee,
        scholarship_available,
        program:programs(id, name, slug, faculty, degree_level)
      ),
      reviews(rating, is_approved)
    `)
    // Only show active colleges (or legacy rows with no status column yet)
    .or('status.eq.active,status.is.null')
    .order('is_featured', { ascending: false })
    .order('name')
    .limit(500)

  if (sp.q)           query = query.ilike('name',        `%${sp.q.trim().slice(0, 80)}%`)
  if (sp.location)    query = query.ilike('location',    `%${sp.location}%`)
  if (sp.province)    query = query.eq('province', sp.province)
  if (sp.district)    query = query.ilike('district', `%${sp.district}%`)
  if (sp.affiliation) query = query.ilike('affiliation', `%${sp.affiliation}%`)
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])

  const { data, error } = await query
  if (error) {
    console.error('Unable to load college directory:', error.message)
    return { all: [], filtered: [], loadError: true }
  }
  const raw = (data ?? []) as (College & { programs?: CollegeProgram[]; reviews?: Review[] })[]

  // Compute avg_rating, review_count, fee range on the server
  const enriched: RichCollege[] = raw.map((c) => {
    const approved = (c.reviews ?? []).filter((r) => r.is_approved)
    const avg_rating =
      approved.length > 0
        ? approved.reduce((sum, r) => sum + r.rating, 0) / approved.length
        : undefined
    const fees = (c.programs ?? []).map((cp) => cp.fee).filter((f): f is number => f != null)
    return {
      ...c,
      avg_rating,
      review_count: approved.length > 0 ? approved.length : undefined,
      fee_min: fees.length > 0 ? Math.min(...fees) : undefined,
      fee_max: fees.length > 0 ? Math.max(...fees) : undefined,
    }
  })

  // "all" = before faculty/level filter (denominator for "X of Y")
  const all = enriched

  // Faculty/level need nested program data — apply in JS
  let filtered = enriched
  if (sp.faculty) {
    const fac = sp.faculty.toLowerCase()
    filtered = filtered.filter((c) =>
      (c.programs ?? []).some((cp) => cp.program?.faculty?.toLowerCase().includes(fac))
    )
  }
  if (sp.level) {
    const storedLevel = sp.level === '+2' ? 'plus_two' : sp.level
    filtered = filtered.filter((c) =>
      c.education_levels?.includes(storedLevel as NonNullable<College['education_levels']>[number]) ||
      (c.programs ?? []).some((cp) => cp.program?.degree_level === sp.level)
    )
  }
  if (sp.program) filtered = filtered.filter(c => (c.programs ?? []).some(cp => cp.program?.slug === sp.program))
  if (sp.scholarship === 'true') filtered = filtered.filter(c => (c.programs ?? []).some(cp => cp.scholarship_available))
  const maxFee = Number(sp.maxFee)
  if (Number.isFinite(maxFee) && maxFee > 0) filtered = filtered.filter(c => (c.programs ?? []).some(cp => cp.fee != null && cp.fee <= maxFee))

  return { all, filtered, loadError: false }
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; affiliation?: string; faculty?: string; level?: string; province?: string; district?: string; maxFee?: string; scholarship?: string; verified?: string; program?: string }
}) {
  const { all, filtered, loadError } = await getColleges(searchParams)
  const pageUrl = absoluteUrl('/colleges')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${pageUrl}#webpage`,
        url: pageUrl,
        name: '+2, Bachelor and Master Colleges in Nepal',
        description: metadata.description,
        mainEntity: { '@id': `${pageUrl}#college-list` },
        isPartOf: { '@id': `${absoluteUrl('/')}#website` },
      },
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Colleges', path: '/colleges' }]),
      {
        '@type': 'ItemList',
        '@id': `${pageUrl}#college-list`,
        name: 'College profiles in Nepal',
        numberOfItems: filtered.length,
        itemListElement: filtered.slice(0, 100).map((college, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: absoluteUrl(`/colleges/${college.slug}`),
          name: college.name,
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#questions`,
        mainEntity: directoryAnswers.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!loadError && <JsonLd data={jsonLd} />}
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="font-display text-3xl font-extrabold text-gray-900">Colleges in Nepal</h1>
        </div>
        <p className="text-gray-500 text-sm">Post-SEE study: +2, Bachelor, Master, diploma and higher education</p>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">
          Search by programme, location, affiliation and study level. Verification badges show which profiles have documented source checks; always confirm current fees, seats and deadlines before applying.
        </p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar placeholder="Search college by name…" redirectTo="/colleges" initialValue={searchParams.q} />
      </div>
      <div className="mb-5 flex flex-wrap gap-2 text-xs"><span className="font-semibold text-gray-500">Popular:</span>{['Kathmandu','Pokhara','Chitwan','Lalitpur','Bhaktapur'].map(place=><Link key={place} href={`/colleges/in/${place.toLowerCase()}`} className="font-semibold text-blue-700 hover:underline">Colleges in {place}</Link>)}</div>

      {/* Filters — handles mobile drawer + desktop inline panel + result counts */}
      <CollegeFilters
        searchParams={searchParams}
        totalCount={all.length}
        filteredCount={filtered.length}
      />

      {/* Grid */}
      {loadError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center text-amber-950">
          <AlertCircle className="mx-auto h-10 w-10 text-amber-600" />
          <h2 className="mt-4 font-display text-xl font-bold">College listings could not load</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6">This is a temporary connection problem—not an empty result. Please reload the page in a moment.</p>
          <Link href="/colleges" className="mt-5 inline-flex rounded-xl bg-amber-950 px-5 py-2.5 text-sm font-bold text-white">Try again</Link>
        </div>
      ) : filtered.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.slice(0, 6).map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>
          {filtered.length > 6 && (
            <AdUnit
              slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_COLLEGES ?? ''}
              format="horizontal"
              className="my-5 rounded-xl border border-gray-200 bg-white min-h-[90px]"
            />
          )}
          {filtered.length > 6 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.slice(6).map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <Building2 className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No colleges found</h3>
          <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
            No listing matches every selected option. Remove one filter or try a shorter college name.
          </p>
          <Link
            href={searchParams.q ? `/colleges?q=${encodeURIComponent(searchParams.q)}` : '/colleges'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear filters
          </Link>
        </div>
      )}

      <section className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8" aria-labelledby="college-directory-questions">
        <p className="text-xs font-bold uppercase tracking-widest text-blue-700">Student guide</p>
        <h2 id="college-directory-questions" className="mt-2 font-display text-2xl font-bold text-gray-950">How to use the college directory</h2>
        <div className="mt-5 divide-y divide-gray-100">
          {directoryAnswers.map(item => (
            <details key={item.question} className="group py-4 first:pt-0 last:pb-0">
              <summary className="cursor-pointer list-none pr-8 text-sm font-semibold text-gray-900 marker:hidden">
                {item.question}<span className="float-right text-blue-600 group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3 border-t border-gray-100 pt-5 text-sm font-semibold">
          <Link href="/compare" className="text-blue-700 hover:underline">Compare shortlisted colleges</Link>
          <Link href="/tools/college-finder" className="text-blue-700 hover:underline">Use the college finder</Link>
          <Link href="/about/editorial-policy" className="text-blue-700 hover:underline">Read our verification policy</Link>
        </div>
      </section>
    </div>
  )
}
