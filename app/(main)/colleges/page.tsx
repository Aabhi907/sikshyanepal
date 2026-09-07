import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import CollegeCard from '@/components/colleges/CollegeCard'
import CollegeFilters from '@/components/colleges/CollegeFilters'
import SearchBar from '@/components/ui/SearchBar'
import type { College, CollegeProgram, Review } from '@/types'
import { Building2 } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: '+2, Bachelor and Master Colleges in Nepal | SikshyaNepal',
  description: 'Browse Nepal colleges for +2, Bachelor, Master, diploma and higher education. Filter by location, affiliation, faculty and level.',
}

// Extended type with server-computed fields the card needs
type RichCollege = College & {
  avg_rating?:   number
  review_count?: number
  fee_min?:      number
  fee_max?:      number
}

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
}): Promise<{ all: RichCollege[]; filtered: RichCollege[] }> {
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
    .limit(200)

  if (sp.q)           query = query.ilike('name',        `%${sp.q}%`)
  if (sp.location)    query = query.ilike('location',    `%${sp.location}%`)
  if (sp.province)    query = query.eq('province', sp.province)
  if (sp.district)    query = query.ilike('district', `%${sp.district}%`)
  if (sp.affiliation) query = query.ilike('affiliation', `%${sp.affiliation}%`)
  if (sp.verified === 'true') query = query.in('verification_status', ['source_verified', 'institution_verified'])

  const { data } = await query
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
      (c.programs ?? []).some((cp) => cp.program?.faculty?.toLowerCase() === fac)
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

  return { all, filtered }
}

export default async function CollegesPage({
  searchParams,
}: {
  searchParams: { q?: string; location?: string; affiliation?: string; faculty?: string; level?: string; province?: string; district?: string; maxFee?: string; scholarship?: string; verified?: string; program?: string }
}) {
  const { all, filtered } = await getColleges(searchParams)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Colleges in Nepal</h1>
        </div>
        <p className="text-gray-500 text-sm">Post-SEE study: +2, Bachelor, Master, diploma and higher education</p>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar placeholder="Search college by name..." redirectTo="/colleges" />
      </div>
      <div className="mb-5 flex flex-wrap gap-2 text-xs"><span className="font-semibold text-gray-500">Popular:</span>{['Kathmandu','Pokhara','Chitwan','Lalitpur','Bhaktapur'].map(place=><Link key={place} href={`/colleges/in/${place.toLowerCase()}`} className="font-semibold text-blue-700 hover:underline">Colleges in {place}</Link>)}</div>

      {/* Filters — handles mobile drawer + desktop inline panel + result counts */}
      <CollegeFilters
        searchParams={searchParams}
        totalCount={all.length}
        filteredCount={filtered.length}
      />

      {/* Grid */}
      {filtered.length > 0 ? (
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
            Try changing your filters or search term — there are lots of great colleges here.
          </p>
          <Link
            href={searchParams.q ? `/colleges?q=${encodeURIComponent(searchParams.q)}` : '/colleges'}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Clear filters
          </Link>
        </div>
      )}
    </div>
  )
}
