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
  TrendingUp,
} from 'lucide-react'

export const dynamic  = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: "SikshyaNepal — Nepal's #1 Education Portal | Colleges, Results & Notices",
  description:
    'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal. Complete guide for Nepali students.',
  keywords: 'Nepal education, colleges Nepal, TU results, KU notice, university programs Nepal',
  openGraph: {
    title: "SikshyaNepal — Nepal's #1 Education Portal",
    description:
      'Find colleges, university programs, exam results, notices, scholarships, and education news in Nepal.',
    type: 'website',
  },
}

const UNIVERSITY_SHOWCASE = [
  {
    short: 'TU', label: 'Tribhuvan University', affiliation: 'Tribhuvan University',
    color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
  },
  {
    short: 'KU', label: 'Kathmandu University', affiliation: 'Kathmandu University',
    color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
  },
  {
    short: 'PU', label: 'Pokhara University', affiliation: 'Pokhara University',
    color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20',
  },
  {
    short: 'PurU', label: 'Purbanchal University', affiliation: 'Purbanchal University',
    color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
  },
]

const FACULTY_STYLES: Record<string, { bg: string; text: string; hover: string }> = {
  'IT & Computing': { bg: 'bg-blue-50',    text: 'text-blue-700',    hover: 'hover:bg-blue-100' },
  Management:       { bg: 'bg-emerald-50', text: 'text-emerald-700', hover: 'hover:bg-emerald-100' },
  Medical:          { bg: 'bg-red-50',     text: 'text-red-700',     hover: 'hover:bg-red-100' },
  Engineering:      { bg: 'bg-orange-50',  text: 'text-orange-700',  hover: 'hover:bg-orange-100' },
  Humanities:       { bg: 'bg-purple-50',  text: 'text-purple-700',  hover: 'hover:bg-purple-100' },
  Science:          { bg: 'bg-cyan-50',    text: 'text-cyan-700',    hover: 'hover:bg-cyan-100' },
  Education:        { bg: 'bg-yellow-50',  text: 'text-yellow-700',  hover: 'hover:bg-yellow-100' },
  Law:              { bg: 'bg-slate-50',   text: 'text-slate-700',   hover: 'hover:bg-slate-100' },
}

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
    { label: 'Colleges Listed',  value: collegeCount > 0 ? `${collegeCount}+` : '500+' },
    { label: 'Programs',         value: programCount > 0 ? `${programCount}+` : '50+' },
    { label: 'Universities',     value: '8+' },
    { label: 'Scholarships',     value: '200+' },
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

export default async function HomePage() {
  const { results, notices, featuredColleges, heroStats, universityCounts } = await getHomeData()

  return (
    <div className="bg-surface">

      {/* ════════════════════════════════════════════════════════
          HERO — full-viewport, left-aligned, editorial
      ════════════════════════════════════════════════════════ */}
      <section className="relative bg-navy overflow-hidden min-h-[88vh] flex items-center">

        {/* Dot grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Radial glow — top right */}
        <div className="absolute -top-60 -right-60 w-[700px] h-[700px] rounded-full bg-brand/20 blur-[120px] pointer-events-none" />
        {/* Radial glow — bottom left */}
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-brand-light/10 blur-[100px] pointer-events-none" />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl">

            {/* Floating announcement badge */}
            <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full
                            bg-white/8 border border-white/12">
              <TrendingUp className="w-3.5 h-3.5 text-brand-light" />
              <span className="text-[13px] font-medium text-slate-300">
                Nepal&apos;s Most Trusted Education Portal
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-mono text-emerald-400">LIVE</span>
            </div>

            {/* Playfair headline */}
            <h1 className="font-display font-bold text-white leading-[1.07] mb-6 text-balance"
                style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}>
              Find Your Perfect<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-light to-sky-400">
                College in Nepal
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-slate-300 text-lg leading-relaxed max-w-xl mb-10">
              Compare colleges, check exam results, read university notices, and
              discover scholarships — all in one place.
            </p>

            {/* Hero search with category dropdown */}
            <HeroSearch />

            {/* Stats row — font-mono */}
            <div className="mt-14 flex flex-wrap gap-8">
              {heroStats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-mono font-bold text-white text-2xl leading-none">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 font-mono uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          EMAIL SUBSCRIBE BAR
      ════════════════════════════════════════════════════════ */}
      <section className="bg-brand border-b border-brand-glow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-white flex-shrink-0 text-center sm:text-left">
              <p className="font-semibold text-sm flex items-center gap-2 justify-center sm:justify-start">
                <Bell className="w-4 h-4" />
                Get result alerts in your inbox
              </p>
              <p className="text-brand-100 text-xs mt-0.5">TU, KU, NEB, CTEVT — be first to know</p>
            </div>
            <div className="w-full sm:flex-1 max-w-sm sm:max-w-none">
              <EmailSubscribe />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          LATEST RESULTS & NOTICES — dark section
      ════════════════════════════════════════════════════════ */}
      <section className="bg-navy border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-eyebrow text-brand-light">Latest Updates</p>
              <h2 className="font-display font-bold text-white text-3xl" style={{ letterSpacing: '-0.02em' }}>
                Results &amp; Notices
              </h2>
              <p className="text-slate-400 text-sm mt-1.5">Live from TU, KU, NEB, CTEVT &amp; more</p>
            </div>
            <div className="hidden sm:flex items-center gap-5">
              <Link href="/results"
                className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                All Results <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/notices"
                className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors">
                All Notices <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Results panel */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-brand/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-3.5 h-3.5 text-brand-light" />
                  </div>
                  <span className="text-sm font-semibold text-white">Latest Results</span>
                </div>
                <Link href="/results" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors sm:hidden">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {results.length > 0 ? (
                <div>
                  {results.map((result) => (
                    <ResultCard key={result.id} result={result} compact dark />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No results yet</p>
              )}
            </div>

            {/* Notices panel */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <Bell className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <span className="text-sm font-semibold text-white">University Notices</span>
                </div>
                <Link href="/notices" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors sm:hidden">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              {notices.length > 0 ? (
                <div>
                  {notices.map((notice) => (
                    <NoticeCard key={notice.id} notice={notice} compact dark />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 py-6 text-center">No notices yet</p>
              )}
            </div>
          </div>

          {/* Mobile — view all links */}
          <div className="flex items-center justify-center gap-6 mt-6 sm:hidden">
            <Link href="/results"
              className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              All Results <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link href="/notices"
              className="text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
              All Notices <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BROWSE BY FACULTY — light section
      ════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="section-eyebrow">Explore</p>
            <h2 className="section-heading">Browse by Faculty</h2>
          </div>
          <Link href="/programs"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-glow transition-colors">
            All Programs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {FACULTIES.map((faculty) => {
            const style = FACULTY_STYLES[faculty.name] ?? { bg: 'bg-slate-50', text: 'text-slate-700', hover: 'hover:bg-slate-100' }
            return (
              <Link
                key={faculty.slug}
                href={`/programs?faculty=${faculty.slug}`}
                className={`flex flex-col items-center gap-2.5 p-4 rounded-xl border border-border
                            transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-md
                            ${style.bg} ${style.hover}`}
              >
                <span className="text-2xl">{faculty.icon}</span>
                <span className={`text-[11px] font-semibold text-center leading-tight ${style.text}`}>
                  {faculty.name}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          BROWSE BY UNIVERSITY — dark section
      ════════════════════════════════════════════════════════ */}
      <section className="bg-navy border-y border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-eyebrow text-brand-light">Universities</p>
              <h2 className="font-display font-bold text-white text-3xl" style={{ letterSpacing: '-0.02em' }}>
                Browse by University
              </h2>
            </div>
            <Link href="/colleges"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">
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
                  className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all duration-200
                              hover:-translate-y-0.5 hover:shadow-card-lg bg-white/5 group
                              ${u.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.bg}`}>
                    <span className={`text-lg font-black font-mono ${u.color}`}>{u.short[0]}</span>
                  </div>
                  <div>
                    <p className={`text-xs font-mono font-bold uppercase tracking-wide ${u.color}`}>{u.short}</p>
                    <p className="text-sm font-semibold text-slate-200 leading-tight mt-0.5">{u.label}</p>
                    {count > 0 && (
                      <p className="text-xs text-slate-500 mt-1 font-mono">{count} college{count !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold flex items-center gap-1 ${u.color} group-hover:gap-1.5 transition-all`}>
                    Browse <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURED COLLEGES — light section
      ════════════════════════════════════════════════════════ */}
      {featuredColleges.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="section-eyebrow">Featured</p>
              <h2 className="section-heading">Top Colleges in Nepal</h2>
              <p className="section-sub">Hand-picked institutions with strong academics &amp; student outcomes</p>
            </div>
            <Link href="/colleges"
              className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-glow transition-colors">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuredColleges.map((college) => (
              <CollegeCard key={college.id} college={college} />
            ))}
          </div>

          <div className="mt-7 sm:hidden text-center">
            <Link href="/colleges" className="btn-navy inline-flex">
              <Building2 className="w-4 h-4" />
              Explore All Colleges
            </Link>
          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════
          PROMO CARDS
      ════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/news"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card
                       hover:shadow-card-xl hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Newspaper className="w-5 h-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-ink text-sm">Education News</h3>
              <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">Latest updates from Nepal&apos;s education sector</p>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/scholarships"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card
                       hover:shadow-card-xl hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-ink text-sm">Scholarships</h3>
              <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">Find funding for your education</p>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
          </Link>

          <Link href="/compare"
            className="group flex items-center gap-4 p-5 rounded-2xl border border-border bg-card
                       hover:shadow-card-xl hover:-translate-y-0.5 transition-all duration-200">
            <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-ink text-sm">Compare Colleges</h3>
              <p className="text-xs text-ink-secondary mt-0.5 line-clamp-1">Side-by-side college comparison</p>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted flex-shrink-0 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
          </Link>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          SOCIAL PROOF CTA STRIP
      ════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-navy px-8 py-10 text-center relative overflow-hidden">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-100"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
          <div className="relative">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Users className="w-4 h-4 text-brand-light" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Trusted by students across Nepal</span>
            </div>
            <p className="font-display font-bold text-white text-3xl mb-1" style={{ letterSpacing: '-0.02em' }}>
              10,000+ Students
            </p>
            <p className="text-slate-400 text-sm mb-7">
              use SikshyaNepal to find colleges, results and notices every month
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/colleges" className="btn-navy border border-white/20 hover:border-white/40">
                Find Your College
              </Link>
              <Link href="/results"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md
                           bg-white/8 border border-white/15 text-white text-sm font-semibold
                           hover:bg-white/15 transition-all">
                Check Results
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
