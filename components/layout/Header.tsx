'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Menu, X, ArrowRight } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'

const navLinks = [
  {
    label: 'Colleges',
    href: '/colleges',
    sub: [
      { label: 'All Colleges',      href: '/colleges' },
      { label: 'Compare Colleges',  href: '/compare' },
      { label: 'Reviews',           href: '/colleges?tab=reviews' },
      { label: 'Scholarships',      href: '/scholarships' },
    ],
  },
  {
    label: 'Programs',
    href: '/programs',
    sub: [
      { label: 'IT & Computing',  href: '/programs?faculty=IT' },
      { label: 'Engineering',     href: '/programs?faculty=Engineering' },
      { label: 'Management',      href: '/programs?faculty=Management' },
      { label: 'Medical',         href: '/programs?faculty=Medical' },
    ],
  },
  { label: 'Results',      href: '/results' },
  { label: 'Notices',      href: '/notices' },
  { label: 'News',         href: '/news' },
  { label: 'Scholarships', href: '/scholarships' },
]

export default function Header() {
  const [mobileOpen,   setMobileOpen]   = useState(false)
  const [openDrop,     setOpenDrop]     = useState<string | null>(null)
  const [searchOpen,   setSearchOpen]   = useState(false)
  const [searchVal,    setSearchVal]    = useState('')
  const [scrolled,     setScrolled]     = useState(false)
  const router   = useRouter()
  const pathname = usePathname()

  useEffect(() => { setMobileOpen(false) }, [pathname])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  useEffect(() => {
    if (!searchOpen) return
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false) }
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [searchOpen])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchVal.trim()) return
    router.push(`/search?q=${encodeURIComponent(searchVal.trim())}`)
    setSearchOpen(false)
    setSearchVal('')
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white/95 backdrop-blur-md shadow-card border-b border-slate-100'
                   : 'bg-white/95 backdrop-blur-md border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
              <div className="w-8 h-8 bg-navy rounded-md flex items-center justify-center flex-shrink-0">
                <span className="text-white font-display font-bold text-sm leading-none">S</span>
              </div>
              <span className="text-[17px] font-display font-bold text-navy leading-none tracking-tight">
                Sikshya<span className="text-brand">Nepal</span>
              </span>
            </Link>

            {/* ── Desktop nav ─────────────────────────────── */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.sub && setOpenDrop(link.label)}
                  onMouseLeave={() => setOpenDrop(null)}
                >
                  <Link
                    href={link.href}
                    className={`relative px-3.5 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(link.href)
                        ? 'text-navy'
                        : 'text-slate-600 hover:text-navy hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute bottom-0 left-3.5 right-3.5 h-0.5 bg-brand rounded-full" />
                    )}
                  </Link>

                  {link.sub && openDrop === link.label && (
                    <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-border rounded-xl shadow-card-xl py-1.5 z-50 animate-slide-down">
                      {link.sub.map((s) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          className="flex items-center justify-between px-4 py-2.5 text-sm text-ink-secondary hover:bg-slate-50 hover:text-navy transition-colors"
                        >
                          {s.label}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Desktop right actions ────────────────────── */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-slate-500 hover:text-navy hover:bg-slate-100 rounded-md transition-colors"
                aria-label="Search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>
              <SubscribeButton variant="header" />
              <Link href="/colleges" className="btn-navy ml-2 text-sm px-4 py-2">
                Find College
              </Link>
            </div>

            {/* ── Mobile ──────────────────────────────────── */}
            <div className="flex items-center gap-1 lg:hidden">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
                <Search className="w-5 h-5" />
              </button>
              <button onClick={() => setMobileOpen(true)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Search overlay ───────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-start justify-center pt-20 px-4 bg-navy/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-card-xl border border-border w-full max-w-xl p-4 animate-slide-down"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
              <input
                autoFocus
                type="text"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search colleges, programs, results..."
                className="w-full pl-10 pr-28 py-3.5 text-sm text-ink bg-surface border border-border rounded-xl
                           focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand
                           placeholder:text-ink-muted transition-all font-sans"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 btn-blue text-xs px-4 py-2"
              >
                Search
              </button>
            </form>
            <p className="text-xs text-ink-muted mt-2.5 ml-1">
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[10px]">Enter</kbd> to search ·{' '}
              <kbd className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[10px]">Esc</kbd> to close
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile slide-over ────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-navy/50 backdrop-blur-sm animate-fade-in" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 inset-y-0 w-full max-w-sm bg-white shadow-card-xl flex flex-col animate-slide-down">
            <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <div className="w-7 h-7 bg-navy rounded-md flex items-center justify-center">
                  <span className="text-white font-display font-bold text-xs">S</span>
                </div>
                <span className="font-display font-bold text-navy text-[16px]">
                  Sikshya<span className="text-brand">Nepal</span>
                </span>
              </Link>
              <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-slate-100 rounded-md text-ink-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive(link.href) ? 'bg-brand-50 text-brand' : 'text-ink hover:bg-slate-50'
                    }`}
                  >
                    {link.label}
                    <ArrowRight className="w-4 h-4 text-ink-muted" />
                  </Link>
                  {link.sub && (
                    <div className="ml-3 mt-0.5 mb-1 space-y-0.5">
                      {link.sub.map((s) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-ink-secondary hover:text-brand hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
              <Link href="/colleges" onClick={() => setMobileOpen(false)} className="btn-navy w-full justify-center py-3 text-sm">
                Find My College
              </Link>
              <Link href="/results" onClick={() => setMobileOpen(false)} className="btn-outline w-full justify-center py-3 text-sm">
                Check Results
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
