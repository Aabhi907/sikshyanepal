'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, ChevronDown } from 'lucide-react'

const CATEGORIES = [
  { label: 'Colleges',  href: '/colleges' },
  { label: 'Results',   href: '/results' },
  { label: 'Notices',   href: '/notices' },
  { label: 'Programs',  href: '/programs' },
]

const POPULAR = [
  { label: 'TU Results',    href: '/results?university=TU' },
  { label: 'KU Notices',    href: '/notices?university=KU' },
  { label: 'BCA Programs',  href: '/programs?faculty=it' },
  { label: 'Scholarships',  href: '/scholarships' },
  { label: 'NEB Results',   href: '/results?university=NEB' },
]

export default function HeroSearch() {
  const [query,    setQuery]    = useState('')
  const [catIdx,   setCatIdx]   = useState(0)
  const [dropOpen, setDropOpen] = useState(false)
  const router = useRouter()

  const cat = CATEGORIES[catIdx]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dest = query.trim()
      ? `${cat.href}?q=${encodeURIComponent(query.trim())}`
      : cat.href
    router.push(dest)
  }

  return (
    <div className="w-full max-w-2xl">
      {/* ── Search bar ─────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-stretch bg-white rounded-xl shadow-card-xl border border-border overflow-hidden"
      >
        {/* Category selector */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setDropOpen((o) => !o)}
            className="h-full px-4 flex items-center gap-1.5 text-sm font-semibold text-ink border-r border-border
                       bg-surface hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            {cat.label}
            <ChevronDown className={`w-3.5 h-3.5 text-ink-muted transition-transform ${dropOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropOpen && (
            <div
              className="absolute top-full left-0 mt-1 w-36 bg-white border border-border rounded-xl shadow-card-xl py-1 z-50"
              onMouseLeave={() => setDropOpen(false)}
            >
              {CATEGORIES.map((c, i) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => { setCatIdx(i); setDropOpen(false) }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    i === catIdx
                      ? 'text-brand font-semibold bg-brand-50'
                      : 'text-ink hover:bg-slate-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text input */}
        <div className="relative flex-1 flex items-center">
          <Search className="absolute left-4 w-4 h-4 text-ink-muted pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${cat.label.toLowerCase()}...`}
            className="w-full h-14 pl-11 pr-4 text-sm text-ink placeholder:text-ink-muted
                       bg-transparent focus:outline-none font-sans"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="flex-shrink-0 m-1.5 px-6 bg-navy text-white text-sm font-semibold rounded-lg
                     hover:bg-navy-800 transition-colors active:scale-[0.98]"
        >
          Search
        </button>
      </form>

      {/* ── Popular searches ───────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-xs font-mono text-white/40 uppercase tracking-wide">Popular:</span>
        {POPULAR.map((p) => (
          <a
            key={p.label}
            href={p.href}
            className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/70
                       border border-white/15 hover:bg-white/20 hover:text-white transition-all"
          >
            {p.label}
          </a>
        ))}
      </div>
    </div>
  )
}
