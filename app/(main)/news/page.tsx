import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import SearchBar from '@/components/ui/SearchBar'
import { formatDateShort } from '@/lib/utils'
import type { News } from '@/types'
import { Calendar, Newspaper, ArrowRight } from 'lucide-react'
import AdUnit from '@/components/ads/AdUnit'
import { COLLEGE_NEWS_TOPICS } from '@/lib/college-news'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Nepal College News, Admissions & Student Achievements',
  description: 'Verified Nepal college news for +2 and Bachelor students: admissions, entrance results, scholarships, awards, hackathons and campus events with original sources.',
  alternates: { canonical: '/news', types: { 'application/rss+xml': '/news/feed.xml' } },
}

const CARD_GRADIENTS = [
  { from: 'from-blue-600',    to: 'to-indigo-700' },
  { from: 'from-violet-600',  to: 'to-purple-700' },
  { from: 'from-emerald-600', to: 'to-teal-700' },
  { from: 'from-orange-500',  to: 'to-rose-600' },
  { from: 'from-sky-600',     to: 'to-cyan-700' },
  { from: 'from-rose-600',    to: 'to-pink-700' },
]

async function getNews(searchParams: { q?: string; topic?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('news').select('*').eq('status', 'published').order('published_date', { ascending: false })
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
  if (searchParams.topic) query = query.eq('content_category', searchParams.topic)
  const { data } = await query.limit(30)
  return (data || []) as News[]
}

function GradientCover({ idx }: { idx: number }) {
  const grad = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
  return (
    <div className={`w-full h-full bg-gradient-to-br ${grad.from} ${grad.to} relative overflow-hidden`}>
      <div
        className="absolute inset-0 opacity-10"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }}
      />
    </div>
  )
}

export default async function NewsPage({ searchParams }: { searchParams: { q?: string; topic?: string } }) {
  const newsList = await getNews(searchParams)
  const featured = newsList[0]
  const rest     = newsList.slice(1)

  return (
    <div className="bg-[#f0f4ff] min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Nepal College News</p>
          <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-2"
              style={{ letterSpacing: '-0.025em' }}>
            College admissions, results and campus updates
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Source-backed updates for +2 and Bachelor students, checked against the original publisher.
          </p>
          <SearchBar placeholder="Search news..." redirectTo="/news" />
          <nav aria-label="College news topics" className="mt-5 flex gap-2 overflow-x-auto pb-1 text-sm">
            <Link href="/news" className={`whitespace-nowrap rounded-full border px-3 py-1.5 font-medium ${!searchParams.topic ? 'border-primary bg-primary text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-primary'}`}>All</Link>
            {Object.entries(COLLEGE_NEWS_TOPICS).map(([slug, topic]) => <Link key={slug} href={`/news/topic/${slug}`} className="whitespace-nowrap rounded-full border border-gray-200 bg-white px-3 py-1.5 font-medium text-gray-600 hover:border-primary">{topic.label}</Link>)}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {newsList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Newspaper className="w-7 h-7 text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-ink mb-1">No news found</h3>
            <p className="text-sm text-gray-400">Check back later for the latest updates</p>
          </div>
        ) : (
          <>
            {/* ── Featured article — magazine 2-col ─────────── */}
            {featured && !searchParams.q && (
              <Link href={`/news/${featured.slug}`} className="group block mb-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#1847c4] hover:shadow-lg transition-all duration-300">
                  <div className="relative h-60 lg:h-auto lg:min-h-[300px] overflow-hidden">
                    {featured.image_url ? (
                      <Image
                        src={featured.image_url}
                        alt={featured.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <GradientCover idx={0} />
                    )}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#1847c4] text-white">
                        Featured
                      </span>
                    </div>
                  </div>
                  <div className="p-7 lg:p-9 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{formatDateShort(featured.published_date)}</span>
                    </div>
                    <h2
                      className="font-display font-bold text-ink text-2xl lg:text-3xl leading-tight mb-4
                                 group-hover:text-[#1847c4] transition-colors"
                      style={{ letterSpacing: '-0.02em' }}
                    >
                      {featured.title}
                    </h2>
                    {featured.content && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-5">
                        {featured.content}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1847c4] group-hover:gap-2.5 transition-all">
                      Read Full Story <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* ── Rest — 3-col grid ─────────────────────────── */}
            {(searchParams.q ? newsList : rest).length > 0 && (() => {
              const articles = searchParams.q ? newsList : rest
              const before   = articles.slice(0, 3)
              const after    = articles.slice(3)

              function NewsCard({ news, idx }: { news: typeof articles[0]; idx: number }) {
                return (
                  <Link key={news.id} href={`/news/${news.slug}`} className="group block">
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden
                                    hover:border-[#1847c4] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      <div className="relative h-44 overflow-hidden">
                        {news.image_url ? (
                          <Image src={news.image_url} alt={news.title} fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <GradientCover idx={idx + 1} />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateShort(news.published_date)}</span>
                        </div>
                        <h2 className="font-semibold text-ink text-sm leading-snug line-clamp-2 mb-1
                                       group-hover:text-[#1847c4] transition-colors">
                          {news.title}
                        </h2>
                        {news.content && (
                          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{news.content}</p>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              }

              return (
                <>
                  {!searchParams.q && (
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        More Stories
                      </span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {before.map((news, idx) => <NewsCard key={news.id} news={news} idx={idx} />)}
                  </div>
                  {after.length > 0 && (
                    <AdUnit
                      slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_RESULTS ?? ''}
                      format="horizontal"
                      className="my-6 rounded-xl border border-gray-200 bg-white min-h-[90px]"
                    />
                  )}
                  {after.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {after.map((news, idx) => <NewsCard key={news.id} news={news} idx={idx + 3} />)}
                    </div>
                  )}
                </>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
