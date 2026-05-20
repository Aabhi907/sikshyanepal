import { createAdminSupabaseClient } from '@/lib/supabase'
import { Building2, Newspaper, Bell, Award, Star, FileText, Mail, Clock, Activity } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

async function getStats() {
  const supabase = createAdminSupabaseClient()
  const [colleges, news, notices, scholarships, reviews, results, subscribers, latestResult, pendingColleges] = await Promise.all([
    supabase.from('colleges').select('id', { count: 'exact', head: true }),
    supabase.from('news').select('id', { count: 'exact', head: true }),
    supabase.from('notices').select('id', { count: 'exact', head: true }),
    supabase.from('scholarships').select('id', { count: 'exact', head: true }),
    supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_approved', false),
    supabase.from('results').select('id', { count: 'exact', head: true }),
    supabase.from('subscribers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('results').select('created_at').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('colleges').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
  ])
  return {
    colleges:        colleges.count        || 0,
    news:            news.count            || 0,
    notices:         notices.count         || 0,
    scholarships:    scholarships.count    || 0,
    pendingReviews:  reviews.count         || 0,
    pendingColleges: pendingColleges.count || 0,
    results:         results.count         || 0,
    subscribers:     subscribers.count     || 0,
    lastScraperRun:  latestResult.data?.created_at ?? null,
  }
}

function formatRelativeTime(iso: string | null): string {
  if (!iso) return 'Never'
  const diff = Date.now() - new Date(iso).getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff % 3_600_000) / 60_000)
  if (h === 0) return `${m}m ago`
  if (h < 24)  return `${h}h ${m}m ago`
  const d = Math.floor(h / 24)
  return `${d}d ago`
}

const cards = [
  { label: 'Colleges',           key: 'colleges',        icon: Building2, href: '/admin/colleges',          color: 'text-blue-400 bg-blue-900/30' },
  { label: 'Pending Colleges',   key: 'pendingColleges', icon: Building2, href: '/admin/colleges/pending',  color: 'text-yellow-400 bg-yellow-900/30', alert: true },
  { label: 'News Articles',      key: 'news',            icon: Newspaper, href: '/admin/news',               color: 'text-purple-400 bg-purple-900/30' },
  { label: 'Notices',            key: 'notices',         icon: Bell,      href: '/admin/notices',            color: 'text-yellow-400 bg-yellow-900/30' },
  { label: 'Scholarships',       key: 'scholarships',    icon: Award,     href: '/admin/scholarships',       color: 'text-green-400 bg-green-900/30' },
  { label: 'Pending Reviews',    key: 'pendingReviews',  icon: Star,      href: '/admin/reviews',            color: 'text-orange-400 bg-orange-900/30' },
  { label: 'Results',            key: 'results',         icon: FileText,  href: '/admin/reviews',            color: 'text-teal-400 bg-teal-900/30' },
  { label: 'Email Subscribers',  key: 'subscribers',     icon: Mail,      href: '/admin/subscribers',        color: 'text-pink-400 bg-pink-900/30' },
]

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div className="p-8 text-gray-100">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back to SikshyaNepal admin</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-10">
        {cards.map(({ label, key, icon: Icon, href, color, alert }) => {
          const val = stats[key as keyof typeof stats] as number
          const isAlert = alert && val > 0
          return (
            <Link key={key} href={href} className="group block">
              <div className={`bg-gray-800 rounded-xl border p-5 hover:border-gray-600 transition-all ${
                isAlert ? 'border-yellow-500/50' : 'border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isAlert && (
                    <span className="px-2 py-0.5 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full">
                      needs review
                    </span>
                  )}
                  {key === 'pendingReviews' && val > 0 && (
                    <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full">
                      {val} pending
                    </span>
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">{val}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* ── System Info ─────────────────────────────────── */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 mb-6">
        <div className="flex items-center gap-2 mb-5">
          <Activity className="w-4 h-4 text-teal-400" />
          <h3 className="font-semibold text-white">System Info</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Colleges',    value: stats.colleges,    color: 'text-blue-400' },
            { label: 'Results',     value: stats.results,     color: 'text-teal-400' },
            { label: 'Notices',     value: stats.notices,     color: 'text-yellow-400' },
            { label: 'Subscribers', value: stats.subscribers, color: 'text-pink-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-gray-700/50 rounded-lg p-3 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}

          {/* Last scraper run */}
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
            </div>
            <p className="text-sm font-semibold text-white leading-tight">
              {formatRelativeTime(stats.lastScraperRun)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Last scraper run</p>
          </div>

          {/* Scraper status */}
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400">Active</span>
            </div>
            <p className="text-xs text-gray-400">Every 6 hours</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: '+ Add College',      href: '/admin/colleges/new' },
              { label: '+ Add News Article', href: '/admin/news/new' },
              { label: '+ Add Notice',       href: '/admin/notices/new' },
              { label: '+ Add Scholarship',  href: '/admin/scholarships/new' },
            ].map(({ label, href }) => (
              <Link key={href} href={href}
                className="block px-4 py-2.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
          <h3 className="font-semibold text-white mb-4">Site Links</h3>
          <div className="space-y-2">
            {[
              { label: 'View Homepage',      href: '/' },
              { label: 'College Listings',   href: '/colleges' },
              { label: 'Results Page',       href: '/results' },
              { label: 'Email Subscribers',  href: '/admin/subscribers' },
              { label: 'Supabase Dashboard', href: 'https://supabase.com/dashboard/project/pobwvtynnqgkbazunzib' },
            ].map(({ label, href }) => (
              <a key={href} href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                className="block px-4 py-2.5 bg-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-gray-600 transition-colors">
                {label} →
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
