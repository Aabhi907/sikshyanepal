import { Metadata } from 'next'
import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase'
import { FACULTIES } from '@/lib/utils'
import HeroSearch from '@/components/ui/HeroSearch'
import ResultCard from '@/components/results/ResultCard'
import NoticeCard from '@/components/notices/NoticeCard'
import CollegeCard from '@/components/colleges/CollegeCard'
import EmailSubscribe from '@/components/notifications/EmailSubscribe'
import type { Result, Notice, College } from '@/types'
import {
  Building2,
  FileText,
  Bell,
  Newspaper,
  Award,
  ArrowRight,
  Users,
} from 'lucide-react'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "SikshyaNepal — Nepal's #1 Education Portal | Colleges, Results & Notices",
  description:
    'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal. Complete guide for Nepali students.',
}

const UNIVERSITY_SHOWCASE = [
  { short: 'TU',   label: 'Tribhuvan University',  affiliation: 'Tribhuvan University',  accent: 'border-blue-500   bg-blue-50   text-blue-700' },
  { short: 'KU',   label: 'Kathmandu University',  affiliation: 'Kathmandu University',  accent: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { short: 'PU',   label: 'Pokhara University',    affiliation: 'Pokhara University',    accent: 'border-amber-500  bg-amber-50  text-amber-700' },
  { short: 'PurU', label: 'Purbanchal University', affiliation: 'Purbanchal University', accent: 'border-purple-500 bg-purple-50 text-purple-700' },
]

async function getHomeData() {
  const supabase = createServerSupabaseClient()

  const [
    resultsRes, noticesRes, collegesRes,
    collegeCountRes, programCountRes,
    tuCountRes, kuCountRes, puCountRes, purUCountRes,
  ] = await Promise.all([
    supabase
      .from('results')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(6),
    supabase
      .from('notices')
      .select('*, university:universities(id, name, short_name, slug, website, created_at)')
      .order('published_date', { ascending: false })
      .limit(6),
    supabase.from('colleges').select('*').eq('is_featured', true).limit(6),
    supabase.from('colleges').select('id', { count: 'exact', head: true }),
    supabase.from('programs').select('id',  { count: 'exact', head: true }),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Tribhuvan%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Kathmandu%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Pokhara%'),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).ilike('affiliation', '%Purbanchal%'),
  ])

  const collegeCount = collegeCountRes.count ?? 0
  const programCount = programCountRes.count ?? 0

  const heroStats = [
    { label: 'Colleges',     value: collegeCount > 0 ? `${collegeCount}+` : '500+' },
    { label: 'Programs',     value: programCount > 0 ? `${programCount}+` : '50+' },
    { label: 'Universities', value: '8+' },
    { label: 'Scholarships', value: '200+' },
  ]

  const universityCounts: Record<string, number> = {
    TU:   tuCountRes.count   ?? 0,
    KU:   kuCountRes.count   ?? 0,
    PU:   puCountRes.count   ?? 0,
    PurU: purUCountRes.count ?? 0,
  }

  return {
    results:          (resultsRes.data  || []) as Result[],
    notices:          (noticesRes.data  || []) as Notice[],
    featuredColleges: (collegesRes.data || []) as College[],
    heroStats,
    universityCounts,
  }
}

// ── Mini card for the hero card stack ─────────────────────────────
function StackCard({
  icon,
  label,
  title,
  meta,
  accentColor,
}: {
  icon: React.ReactNode
  label: string
  title: string
  meta: string
  accentColor: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${accentColor}`}>
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug mb-2">{title}</p>
      <span className="text-[11px] font-mono text-gray-400">{meta}</span>
    </div>
  )
}

export default async function HomePage() {
  const { results, notices, featuredColleges, heroStats, universityCounts } = await getHomeData()

  const latestResult  = results[0]
  const latestNotice  = notices[0]
  const featuredFirst = featuredColleges[0]

  return (
    <div>

      {/* ════════════════════════════════════════════════════════
          HERO — two-column, light background
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* ── Left column (60%) ────────────────────── */}
            <div className="lg:col-span-3">

              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
                              bg-blue-50 text-[#1847c4] border border-blue-200 mb-6">
                🇳🇵 Nepal&apos;s #1 Education Platform
              </div>

              {/* Headline */}
              <h1
                className="font-display font-bold text-ink leading-[1.1] tracking-tight mb-5 text-balance"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 3.75rem)' }}
              >
                Everything you need<br />
                after{' '}
                <span className="text-[#1847c4]">SEE.</span>
              </h1>

              {/* Sub */}
              <p className="text-gray-500 text-xl leading-relaxed mb-8 max-w-lg">
                Colleges, results, notices, reviews — all in one place.
                Updated daily.
              </p>

              {/* Search */}
              <HeroSearch />
            </div>

            {/* ── Right column (40%) — card stack ──────── */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="relative h-[340px]">

                {/* Back card — college */}
                <div
                  className="absolute bg-white rounded-2xl border border-gray-100 shadow-card p-4 w-full"
                  style={{ top: '24px', left: '24px', transform: 'rotate(2deg)', zIndex: 1 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center">
                      <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Featured College</span>
                  </div>
                  <p className="text-sm font-semibold text-ink line-clamp-2 leading-snug mb-2">
                    {featuredFirst?.name ?? 'Tribhuvan University College'}
                  </p>
                  <span className="text-[11px] font-mono text-gray-400">
                    {featuredFirst?.location ?? 'Kathmandu, Nepal'}
                  </span>
                </div>

                {/* Middle card — notice */}
                <div
                  className="absolute bg-white rounded-2xl border border-gray-100 shadow-card-md p-4 w-full"
                  style={{ top: '12px', left: '12px', transform: 'rotate(-1deg)', zIndex: 2 }}
                >
                  {latestNotice ? (
                    <StackCard
                      icon={<Bell className="w-3.5 h-3.5 text-orange-600" />}
                      label="New Notice"
                      title={latestNotice.title}
                      meta={latestNotice.university?.short_name ?? 'University'}
                      accentColor="bg-orange-50"
                    />
                  ) : (
                    <StackCard
                      icon={<Bell className="w-3.5 h-3.5 text-orange-600" />}
                      label="New Notice"
                      title="KU Exam Schedule — Spring 2024"
                      meta="Kathmandu University"
                      accentColor="bg-orange-50"
                    />
                  )}
                </div>

                {/* Front card — result */}
                <div
                  className="absolute bg-white rounded-2xl border border-gray-200 shadow-card-xl p-4 w-full"
                  style={{ top: 0, left: 0, zIndex: 3 }}
                >
                  {latestResult ? (
                    <StackCard
                      icon={<FileText className="w-3.5 h-3.5 text-[#1847c4]" />}
                      label="Latest Result"
                      title={latestResult.title}
                      meta={latestResult.university?.short_name ?? 'University'}
                      accentColor="bg-blue-50"
                    />
                  ) : (
                    <StackCard
                      icon={<FileText className="w-3.5 h-3.5 text-[#1847c4]" />}
                      label="Latest Result"
                      title="TU BCA 4th Semester Result Published"
                      meta="Tribhuvan University"
                      accentColor="bg-blue-50"
                    />
                  )}

                  {/* Live indicator */}
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] text-gray-400 font-mono">Updated live · Just now</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS BAR — dark navy
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0d1b3e' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-white/10">
            {heroStats.map((stat, i) => (
              <div key={stat.label} className={`px-6 py-2 text-center ${i === 0 ? 'pl-0' : ''} ${i === heroStats.length - 1 ? 'pr-0' : ''}`}>
                <p className="font-mono font-bold text-white text-3xl leading-none mb-1">
                  {stat.value}
                </p>
                <p className="text-[11px] font-medium text-blue-300 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          EMAIL SUBSCRIBE BAR
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#1847c4] border-b border-[#1340b0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-white flex-shrink-0 text-center sm:text-left">
              <p className="font-semibold text-sm flex items-center gap-2 justify-center sm:justify-start">
                <Bell className="w-4 h-4" />
                Get result alerts in your inbox
              </p>
              <p className="text-blue-200 text-xs mt-0.5">TU, KU, NEB, CTEVT — be first to know</p>
            </div>
            <div className="w-full sm:flex-1 max-w-sm sm:max-w-none">
              <EmailSubscribe />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          LATEST RESULTS — subtle blue bg
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0f4ff] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-tag-blue">Latest Updates</span>
              <h2 className="section-heading">Results &amp; Notices</h2>
              <p className="section-sub text-sm">Live from TU, KU, NEB, CTEVT &amp; more</p>
            </div>
            <div className="hidden sm:flex items-center gap-5">
              <Link href="/results"
                className="text-sm font-medium text-[#1847c4] hover:text-[#1340b0] flex items-center gap-1.5 transition-colors">
                All Results <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/notices"
                className="text-sm font-medium text-[#1847c4] hover:text-[#1340b0] flex items-center gap-1.5 transition-colors">
                All Notices <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Results panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#1847c4]" />
                  </div>
                  <span className="text-sm font-semibold text-ink">Latest Results</span>
                </div>
                <Link href="/results" className="text-xs text-[#1847c4] hover:underline flex items-center gap-1 sm:hidden">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {results.length > 0 ? (
                <div>
                  {results.map((r) => (
                    <ResultCard key={r.id} result={r} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">No results yet</p>
              )}
            </div>

            {/* Notices panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  <span className="text-sm font-semibold text-ink">University Notices</span>
                </div>
                <Link href="/notices" className="text-xs text-[#1847c4] hover:underline flex items-center gap-1 sm:hidden">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {notices.length > 0 ? (
                <div>
                  {notices.map((n) => (
                    <NoticeCard key={n.id} notice={n} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">No notices yet</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 mt-5 sm:hidden">
            <Link href="/results"
              className="text-sm font-medium text-[#1847c4] flex items-center gap-1.5">
              All Results <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/notices"
              className="text-sm font-medium text-[#1847c4] flex items-center gap-1.5">
              All Notices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED COLLEGES — white
      ════════════════════════════════════════════════════════ */}
      {featuredColleges.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-end justify-between mb-7">
              <div>
                <span className="section-tag">Top Colleges</span>
                <h2 className="section-heading">Featured Colleges</h2>
                <p className="section-sub text-sm">Hand-picked institutions with strong academics &amp; placements</p>
              </div>
              <Link href="/colleges"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1847c4] hover:text-[#1340b0] transition-colors">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featuredColleges.map((college) => (
                <CollegeCard key={college.id} college={college} />
              ))}
            </div>

            <div className="mt-7 sm:hidden text-center">
              <Link href="/colleges" className="btn-primary inline-flex">
                <Building2 className="w-4 h-4" />
                Explore All Colleges
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          BROWSE BY PROGRAM — subtle bg
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0f4ff] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-tag">Explore</span>
              <h2 className="section-heading">Browse by Program</h2>
            </div>
            <Link href="/programs"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1847c4] hover:text-[#1340b0] transition-colors">
              All Programs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {FACULTIES.map((faculty) => (
              <Link
                key={faculty.slug}
                href={`/programs?faculty=${faculty.slug}`}
                className="flex flex-col items-center gap-2.5 p-4 bg-white rounded-xl border border-gray-200
                           hover:border-[#1847c4] hover:shadow-card-md transition-all duration-200
                           hover:-translate-y-0.5 group"
              >
                <span className="text-2xl">{faculty.icon}</span>
                <span className="text-[11px] font-semibold text-center leading-tight text-gray-600 group-hover:text-[#1847c4] transition-colors">
                  {faculty.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BROWSE BY UNIVERSITY — white
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-7">
            <div>
              <span className="section-tag-blue">Universities</span>
              <h2 className="section-heading">Browse by University</h2>
            </div>
            <Link href="/colleges"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1847c4] hover:text-[#1340b0] transition-colors">
              All Colleges <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {UNIVERSITY_SHOWCASE.map((u) => {
              const count   = universityCounts[u.short] ?? 0
              const [border, bg, text] = u.accent.split(' ')
              return (
                <Link
                  key={u.short}
                  href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                  className={`flex flex-col gap-3 p-5 bg-white rounded-2xl border ${border}
                              hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200 group`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                    <span className={`text-base font-display font-bold ${text}`}>{u.short}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-mono font-bold uppercase tracking-wide ${text}`}>{u.short}</p>
                    <p className="text-sm font-semibold text-ink leading-tight mt-0.5">{u.label}</p>
                    {count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{count} college{count !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${text} group-hover:gap-1.5 transition-all`}>
                    Browse <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          PROMO CARDS — subtle bg
      ════════════════════════════════════════════════════════ */}
      <section className="bg-[#f0f4ff] border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/news"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white
                         hover:border-[#1847c4] hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Newspaper className="w-5 h-5 text-[#1847c4]" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink text-sm">Education News</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">Latest from Nepal&apos;s education sector</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-[#1847c4] group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link href="/scholarships"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white
                         hover:border-[#f97316] hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink text-sm">Scholarships</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">Find funding for your education</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-orange-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link href="/compare"
              className="group flex items-center gap-4 p-5 rounded-2xl border border-gray-200 bg-white
                         hover:border-[#1847c4] hover:shadow-card-lg hover:-translate-y-0.5 transition-all duration-200">
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-ink text-sm">Compare Colleges</h3>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">Side-by-side college comparison</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SOCIAL PROOF STRIP — dark navy
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#0d1b3e' }} className="py-14 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">
              Trusted by students across Nepal
            </span>
          </div>
          <p className="font-display font-bold text-white text-4xl mb-2" style={{ letterSpacing: '-0.02em' }}>
            10,000+ Students
          </p>
          <p className="text-slate-400 text-sm mb-8">
            use SikshyaNepal to find colleges, results and notices every month
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/colleges"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                         bg-[#1847c4] text-white text-sm font-semibold hover:bg-[#1340b0] transition-colors"
            >
              Find Your College
            </Link>
            <Link
              href="/results"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                         bg-white/8 text-white text-sm font-semibold border border-white/15
                         hover:bg-white/15 transition-colors"
            >
              Check Results
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
