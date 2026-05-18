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
  Monitor,
  BarChart3,
  Wrench,
  HeartPulse,
  BookOpen,
  FlaskConical,
  GraduationCap,
  Scale,
  Stethoscope,
  Sprout,
  TreePine,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const FACULTY_ICONS: Record<string, LucideIcon> = {
  'it':          Monitor,
  'management':  BarChart3,
  'engineering': Wrench,
  'medical':     HeartPulse,
  'humanities':  BookOpen,
  'science':     FlaskConical,
  'education':   GraduationCap,
  'law':         Scale,
  'nursing':     Stethoscope,
  'agriculture': Sprout,
  'forestry':    TreePine,
  'architecture':Building2,
}

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "SikshyaNepal — Nepal's #1 Education Portal | Colleges, Results & Notices",
  description:
    'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal. Complete guide for Nepali students.',
}

const UNIVERSITY_SHOWCASE = [
  { short: 'TU',   label: 'Tribhuvan University',  affiliation: 'Tribhuvan University',  textColor: 'text-blue-600',   iconBg: 'bg-blue-50' },
  { short: 'KU',   label: 'Kathmandu University',  affiliation: 'Kathmandu University',  textColor: 'text-green-600',  iconBg: 'bg-green-50' },
  { short: 'PU',   label: 'Pokhara University',    affiliation: 'Pokhara University',    textColor: 'text-orange-500', iconBg: 'bg-orange-50' },
  { short: 'PurU', label: 'Purbanchal University', affiliation: 'Purbanchal University', textColor: 'text-purple-600', iconBg: 'bg-purple-50' },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 md:pt-20 pb-16 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16 items-center">

            {/* ── Left column (60%) ────────────────────── */}
            <div className="lg:col-span-3">

              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium
                              bg-blue-50 text-[#1847c4] border border-blue-200 mb-6">
                🇳🇵 Trusted by students across Nepal
              </div>

              {/* Headline */}
              <h1
                className="font-display font-bold text-ink leading-[1.1] tracking-tight mb-5 text-balance"
                style={{ fontSize: 'clamp(2.6rem, 5.5vw, 3.75rem)' }}
              >
                Everything about<br />
                <span className="text-[#1847c4]">Education in Nepal.</span>
              </h1>

              {/* Sub */}
              <p className="text-gray-500 text-xl leading-relaxed mb-8 max-w-lg">
                Colleges, results, notices, reviews, scholarships —
                Nepal&apos;s most complete education platform. Updated daily.
              </p>

              {/* Search */}
              <HeroSearch />
            </div>

            {/* ── Right column (40%) — card fan ──────── */}
            <div className="hidden lg:block lg:col-span-2">
              <div className="relative h-[380px]">

                {/* Card 3 — bottom — Featured College (green) */}
                <div
                  className="absolute bg-white rounded-2xl border border-gray-100 shadow-card p-4 w-full"
                  style={{ top: '216px', left: '-10px', transform: 'rotate(2deg)', zIndex: 1 }}
                >
                  <StackCard
                    icon={<Building2 className="w-3.5 h-3.5 text-emerald-600" />}
                    label="Featured College"
                    title={featuredFirst?.name ?? 'Tribhuvan University College'}
                    meta={featuredFirst?.location ?? 'Kathmandu, Nepal'}
                    accentColor="bg-emerald-50"
                  />
                </div>

                {/* Card 2 — middle — Latest Notice (orange) */}
                <div
                  className="absolute bg-white rounded-2xl border border-gray-100 shadow-card-md p-4 w-full"
                  style={{ top: '108px', left: '10px', transform: 'rotate(-1.5deg)', zIndex: 2 }}
                >
                  <StackCard
                    icon={<Bell className="w-3.5 h-3.5 text-orange-500" />}
                    label="Latest Notice"
                    title={latestNotice?.title ?? 'KU Exam Schedule — Spring 2025'}
                    meta={latestNotice?.university?.short_name ?? 'Kathmandu University'}
                    accentColor="bg-orange-50"
                  />
                </div>

                {/* Card 1 — top — Latest Result (blue) */}
                <div
                  className="absolute bg-white rounded-2xl border border-gray-200 shadow-card-xl p-4 w-full"
                  style={{ top: 0, left: 0, transform: 'rotate(0.5deg)', zIndex: 3 }}
                >
                  <StackCard
                    icon={<FileText className="w-3.5 h-3.5 text-[#1847c4]" />}
                    label="Latest Result"
                    title={latestResult?.title ?? 'TU BCA 4th Semester Result Published'}
                    meta={latestResult?.university?.short_name ?? 'Tribhuvan University'}
                    accentColor="bg-blue-50"
                  />
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-tag-blue">Latest Updates</span>
              <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.02em' }}>
                Results &amp; Notices
              </h2>
              <p className="text-gray-400 text-sm mt-1">Live from TU, KU, NEB, CTEVT &amp; more</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Results panel */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-[#1847c4]" />
                  </div>
                  <span className="text-sm font-semibold text-ink">Latest Results</span>
                </div>
                <Link href="/results"
                  className="text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] flex items-center gap-1 transition-colors duration-200">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {results.length > 0 ? (
                <div>
                  {results.slice(0, 5).map((r) => (
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
                <Link href="/notices"
                  className="text-sm font-semibold text-[#1847c4] hover:text-[#1340b0] flex items-center gap-1 transition-colors duration-200">
                  View all <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {notices.length > 0 ? (
                <div>
                  {notices.slice(0, 5).map((n) => (
                    <NoticeCard key={n.id} notice={n} compact />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 py-6 text-center">No notices yet</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED COLLEGES — white
      ════════════════════════════════════════════════════════ */}
      {featuredColleges.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="section-tag">Top Colleges</span>
                <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.02em' }}>
                  Featured Colleges
                </h2>
                <p className="text-gray-400 text-sm mt-1">Hand-picked institutions with strong academics &amp; placements</p>
              </div>
              <Link href="/colleges"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1847c4] hover:text-[#1340b0] transition-colors duration-200">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-tag">Explore</span>
              <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.02em' }}>
                Browse by Program
              </h2>
            </div>
            <Link href="/programs"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1847c4] hover:text-[#1340b0] transition-colors duration-200">
              All Programs <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {FACULTIES.map((faculty) => {
              const Icon = FACULTY_ICONS[faculty.slug] ?? Monitor
              return (
                <Link
                  key={faculty.slug}
                  href={`/programs?faculty=${faculty.slug}`}
                  className="group flex flex-col items-center gap-3 text-center p-6 bg-white rounded-2xl
                             border border-gray-200 hover:bg-[#1847c4] hover:border-[#1847c4]
                             hover:shadow-lg transition-all duration-200 cursor-pointer"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center
                                  group-hover:bg-white/20 transition-colors">
                    <Icon className="w-8 h-8 text-[#1847c4] group-hover:text-white transition-colors" />
                  </div>
                  <span className="font-semibold text-gray-900 text-sm leading-tight
                                   group-hover:text-white transition-colors">
                    {faculty.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BROWSE BY UNIVERSITY — white
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="section-tag-blue">Universities</span>
              <h2 className="font-display font-bold text-3xl text-ink" style={{ letterSpacing: '-0.02em' }}>
                Browse by University
              </h2>
            </div>
            <Link href="/colleges"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#1847c4] hover:text-[#1340b0] transition-colors duration-200">
              All Colleges <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {UNIVERSITY_SHOWCASE.map((u) => {
              const count = universityCounts[u.short] ?? 0
              return (
                <Link
                  key={u.short}
                  href={`/colleges?affiliation=${encodeURIComponent(u.affiliation)}`}
                  className="flex flex-col gap-3 p-5 bg-white rounded-2xl border border-gray-200
                             hover:border-[#1847c4] hover:shadow-md transition-all duration-200 group"
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${u.iconBg}`}>
                    <span className={`text-xl font-display font-bold ${u.textColor}`}>{u.short}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{u.label}</p>
                    {count > 0 && (
                      <p className="text-xs text-gray-400 mt-1">{count} college{count !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-[#1847c4] flex items-center gap-1 group-hover:gap-1.5 transition-all duration-200">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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
      <section style={{ backgroundColor: '#0d1b3e' }} className="py-16 text-center">
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
