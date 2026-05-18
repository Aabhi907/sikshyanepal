import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { createServerSupabaseClient } from '@/lib/supabase'
import SearchBar from '@/components/ui/SearchBar'
import { formatDateShort } from '@/lib/utils'
import type { News } from '@/types'
import { Calendar, Newspaper, ArrowRight } from 'lucide-react'

export const dynamic   = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'Education News Nepal | SikshyaNepal',
  description: 'Latest education news from Nepal. Stay updated with policy changes, exam announcements, and more.',
}

const CARD_GRADIENTS = [
  { from: 'from-blue-600',    to: 'to-indigo-700' },
  { from: 'from-violet-600',  to: 'to-purple-700' },
  { from: 'from-emerald-600', to: 'to-teal-700' },
  { from: 'from-orange-500',  to: 'to-rose-600' },
  { from: 'from-sky-600',     to: 'to-cyan-700' },
  { from: 'from-rose-600',    to: 'to-pink-700' },
]

async function getNews(searchParams: { q?: string }) {
  const supabase = createServerSupabaseClient()
  let query = supabase.from('news').select('*').order('published_date', { ascending: false })
  if (searchParams.q) query = query.ilike('title', `%${searchParams.q}%`)
  const { data } = await query.limit(30)
  return (data || []) as News[]
}

function GradientCover({ title, idx, featured = false }: { title: string; idx: number; featured?: boolean }) {
  const grad = CARD_GRADIENTS[idx % CARD_GRADIENTS.length]
  return (
    <div className={`w-full h-full bg-gradient-to-br ${grad.from} ${grad.to} relative overflow-hidden`}>
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '18px 18px' }}
      />
      <span className={`absolute font-display font-black text-white/15 select-none leading-none
        ${featured ? 'text-[140px] right-2 -bottom-4' : 'text-[72px] -right-1 -bottom-2'}`}>
        {title.charAt(0).toUpperCase()}
      </span>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <span className="w-10 h-10 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-display font-black text-lg">
            S
          </span>
          <span className="text-xs font-medium text-white/70 tracking-wide">SikshyaNepal</span>
        </div>
      </div>
    </div>
  )
}

export default async function NewsPage({ searchParams }: { searchParams: { q?: string } }) {
  const newsList = await getNews(searchParams)
  const featured = newsList[0]
  const rest     = newsList.slice(1)

  return (
    <div className="bg-[#f0f4ff] min-h-screen">

      {/* ── Page header ─────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <span className="section-tag">Education News</span>
          <h1 className="font-display font-bold text-ink text-3xl sm:text-4xl mb-2"
              style={{ letterSpacing: '-0.02em' }}>
            Latest Updates
          </h1>
          <p className="text-gray-500 text-sm mb-6">
            Policy changes, exam announcements, and education news from Nepal
          </p>
          <SearchBar placeholder="Search news..." redirectTo="/news" />
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
                      <GradientCover title={featured.title} idx={0} featured />
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
            {((searchParams.q ? newsList : rest)).length > 0 && (
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
                  {(searchParams.q ? newsList : rest).map((news, idx) => (
                    <Link key={news.id} href={`/news/${news.slug}`} className="group block">
                      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden
                                      hover:border-[#1847c4] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                        <div className="relative h-44 overflow-hidden">
                          {news.image_url ? (
                            <Image
                              src={news.image_url}
                              alt={news.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <GradientCover title={news.title} idx={idx + 1} />
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
                            <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                              {news.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
