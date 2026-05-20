'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const TRENDING = [
  { label: 'TU Results',   href: '/results?university=TU' },
  { label: 'KU Notices',   href: '/notices?university=KU' },
  { label: 'BCA Colleges', href: '/colleges?q=BCA' },
  { label: 'NEB Results',  href: '/results?university=NEB' },
  { label: 'Scholarships', href: '/scholarships' },
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/colleges?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="w-full">
      {/* ── Search bar ─────────────────────────────────── */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-stretch border-2 border-gray-200 rounded-xl bg-white overflow-hidden
                        shadow-card-md focus-within:border-blue-500 focus-within:shadow-card-lg
                        transition-all duration-150">
          <div className="relative flex-1 flex items-center">
            <Search className="absolute left-4 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search colleges, programs, results..."
              className="w-full h-14 pl-12 pr-4 text-sm text-ink placeholder:text-gray-400
                         bg-transparent focus:outline-none font-sans"
            />
          </div>
          <button
            type="submit"
            className="flex-shrink-0 m-1.5 px-6 bg-[#1847c4] text-white text-sm font-semibold
                       rounded-lg hover:bg-[#1340b0] transition-colors duration-150 active:scale-[0.98]"
            style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
          >
            Search
          </button>
        </div>
      </form>

      {/* ── Trending tags ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-3.5">
        <span className="text-xs font-medium text-gray-400">Trending:</span>
        {TRENDING.map((tag) => (
          <a
            key={tag.label}
            href={tag.href}
            className="px-3 py-1 rounded-full text-xs font-medium text-gray-600
                       border border-gray-200 bg-white
                       hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700
                       transition-all duration-150"
          >
            {tag.label}
          </a>
        ))}
      </div>
    </div>
  )
}
