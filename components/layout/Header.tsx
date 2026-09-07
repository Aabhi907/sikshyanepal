'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronDown, BookOpenCheck, Search } from 'lucide-react'
import SubscribeButton from '@/components/notifications/SubscribeButton'

const navLinks = [
  {
    label: 'Schools',
    href: '/schools',
    sub: [
      { label: 'All Schools',       href: '/schools' },
      { label: 'Verified Schools',  href: '/schools?verified=true' },
      { label: 'Secondary Schools', href: '/schools?level=secondary' },
      { label: 'Community Schools', href: '/schools?ownership=community' },
      { label: 'School Finder', href: '/tools/school-finder' },
      { label: 'Add a School', href: '/submit-school' },
      { label: 'Compare Schools', href: '/schools/compare' },
      { label: 'Schools Near Me', href: '/schools/nearby' },
    ],
  },
  { label: 'Admissions', href: '/admissions', sub: [
    { label: 'All Admissions', href: '/admissions' },
    { label: 'Admission Status', href: '/admissions/status' },
    { label: 'Admission Planner', href: '/admissions/planner' },
    { label: 'School Admissions', href: '/admissions?institution=school' },
    { label: 'College Admissions', href: '/admissions?institution=college' },
  ] },
  {
    label: 'Colleges',
    href: '/colleges',
    sub: [
      { label: 'All Colleges',     href: '/colleges' },
      { label: '+2 Colleges',      href: '/colleges?level=%2B2' },
      { label: 'Bachelor Colleges', href: '/colleges?level=bachelor' },
      { label: 'Master Colleges',  href: '/colleges?level=master' },
      { label: 'Compare Colleges', href: '/compare' },
      { label: 'Colleges Near Me', href: '/colleges/nearby' },
      { label: 'Reviews',          href: '/colleges?tab=reviews' },
      { label: 'Scholarships',     href: '/scholarships' },
    ],
  },
  {
    label: 'Explore',
    href: '/programs',
    sub: [
      { label: 'Programs', href: '/programs' },
      { label: 'IT & Computing', href: '/programs?faculty=it' },
      { label: 'Engineering',    href: '/programs?faculty=engineering' },
      { label: 'Management',     href: '/programs?faculty=management' },
      { label: 'Medical',        href: '/programs?faculty=medical' },
      { label: 'Career Explorer', href: '/careers' },
      { label: 'Skills & Opportunities', href: '/opportunities' },
      { label: 'Student Wellbeing', href: '/wellbeing' },
      { label: 'Results', href: '/results' },
      { label: 'Entrance Exams', href: '/entrance-exams' },
      { label: 'Notices', href: '/notices' },
      { label: 'Education News', href: '/news' },
      { label: 'Scholarships', href: '/scholarships' },
      { label: 'SEE & NEB GPA Calculator', href: '/tools/gpa-calculator' },
      { label: 'College Cost Calculator', href: '/tools/college-cost-calculator' },
      { label: 'College Finder', href: '/tools/college-finder' },
      { label: 'Admission Checklist', href: '/tools/admission-checklist' },
      { label: 'Program Finder Quiz', href: '/tools/program-finder' },
      { label: 'My Path', href: '/my-path' },
      { label: 'Saved colleges', href: '/account/saved' },
      { label: 'Saved schools', href: '/account/saved-schools' },
      { label: 'Claim an Institution', href: '/account/claim' },
      { label: 'My Institutions', href: '/account/institutions' },
    ],
  },
  { label: 'नेपाली', href: '/ne' },
]

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openDrop,   setOpenDrop]   = useState<string | null>(null)
  const [scrolled,   setScrolled]   = useState(false)
  const pathname = usePathname()

  // Close dropdown on route change
  useEffect(() => { setMobileOpen(false); setOpenDrop(null) }, [pathname])

  // Scroll shadow
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openDrop) return
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.nav-dropdown')) {
        setOpenDrop(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [openDrop])

  // Close dropdown on Escape key
  useEffect(() => {
    if (!openDrop) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDrop(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [openDrop])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <>
      <header
        className={`sticky top-0 z-50 bg-white transition-all duration-200 ${
          scrolled ? 'shadow-sm border-b border-border' : 'border-b border-border'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ─────────────────────────────────────── */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-[17px] leading-none tracking-tight">
                <span className="text-ink">Sikshya</span>
                <span className="text-primary">Nepal</span>
              </span>
            </Link>

            {/* ── Desktop nav ──────────────────────────────── */}
            <nav className="hidden xl:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  // nav-dropdown class is the sentinel for outside-click detection
                  className="relative nav-dropdown"
                >
                  {link.sub ? (
                    /* Items with sub-menu: button toggles dropdown, no navigation */
                    <button
                      onClick={() => setOpenDrop(openDrop === link.label ? null : link.label)}
                      className={`flex items-center gap-0.5 px-3.5 py-2 text-sm font-[500] rounded-lg transition-colors duration-150 ${
                        isActive(link.href)
                          ? 'text-primary bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-150 ${openDrop === link.label ? 'rotate-180' : ''}`} />
                    </button>
                  ) : (
                    /* Plain links: navigate directly */
                    <Link
                      href={link.href}
                      className={`flex items-center gap-0.5 px-3.5 py-2 text-sm font-[500] rounded-lg transition-colors duration-150 ${
                        isActive(link.href)
                          ? 'text-primary bg-primary-50'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {link.label}
                    </Link>
                  )}

                  {link.sub && openDrop === link.label && (
                    <div className={`absolute top-full z-50 ${link.label === 'Explore' ? 'right-0' : 'left-0'}`}>
                      {/* Invisible bridge: fills the gap between trigger bottom and
                          dropdown top so the mouse never "misses" while moving down */}
                      <div className="absolute -top-2 left-0 right-0 h-2 bg-transparent" />
                      <div className={`mt-1.5 max-h-[70vh] overflow-y-auto overscroll-contain bg-white border border-border rounded-xl shadow-card-lg py-1.5 animate-slide-down ${link.label === 'Explore' ? 'grid w-[32rem] grid-cols-2 gap-x-1 p-2' : 'w-64'}`}>
                        {link.sub.map((s) => (
                          <Link
                            key={s.label}
                            href={s.href}
                            onClick={() => setOpenDrop(null)}
                            className="block rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary transition-colors duration-150"
                          >
                            {s.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* ── Desktop right actions ────────────────────── */}
            <div className="hidden xl:flex items-center gap-2">
              <button onClick={() => window.dispatchEvent(new Event('open-site-search'))} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-500 hover:border-blue-200 hover:text-primary" aria-label="Search SikshyaNepal"><Search className="h-4 w-4" /><span className="hidden xl:inline">Search</span><kbd className="hidden xl:inline rounded border border-gray-200 px-1.5 py-0.5 text-[10px] text-gray-400">⌘K</kbd></button>
              <SubscribeButton variant="header" />
              <Link
                href="/schools"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-600 transition-colors duration-150"
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)' }}
              >
                Find School
              </Link>
            </div>

            {/* ── Mobile ───────────────────────────────────── */}
            <button
              onClick={() => setMobileOpen(true)}
              className="xl:hidden p-2 text-ink-secondary hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile slide-over ────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] xl:hidden">
          <div
            className="absolute inset-0 bg-black/40 animate-fade-in"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 inset-y-0 w-full max-w-sm bg-white flex flex-col animate-slide-down shadow-card-xl">

            {/* Header */}
            <div className="flex items-center justify-between px-5 h-16 border-b border-border flex-shrink-0">
              <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center flex-shrink-0">
                  <BookOpenCheck className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-display font-bold text-[16px]">
                  <span className="text-ink">Sikshya</span>
                  <span className="text-primary">Nepal</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-ink-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0.5">
              {navLinks.map((link) => (
                <div key={link.label}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      isActive(link.href)
                        ? 'bg-primary-50 text-primary'
                        : 'text-ink hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                  {link.sub && (
                    <div className="ml-3 mt-0.5 mb-1 space-y-0.5">
                      {link.sub.map((s) => (
                        <Link
                          key={s.label}
                          href={s.href}
                          onClick={() => setMobileOpen(false)}
                          className="block px-3 py-2 text-sm text-ink-secondary hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          {s.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom CTAs */}
            <div className="p-4 border-t border-border space-y-2 flex-shrink-0">
              <Link
                href="/schools"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors"
              >
                Find My School
              </Link>
              <Link
                href="/results"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary border-2 border-primary text-sm font-semibold rounded-xl hover:bg-primary-50 transition-colors"
              >
                Check Results
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
