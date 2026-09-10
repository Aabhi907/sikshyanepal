import Link from 'next/link'
import { Mail, MapPin, ArrowUpRight, BookOpenCheck } from 'lucide-react'
import CookieSettingsButton from '@/components/privacy/CookieSettingsButton'

const exploreLinks = [
  { label: 'All Schools',      href: '/schools' },
  { label: 'School Finder',    href: '/tools/school-finder' },
  { label: 'Add Your School',  href: '/submit-school' },
  { label: 'All Colleges',     href: '/colleges' },
  { label: 'Admissions Open',  href: '/admissions' },
  { label: 'Compare Colleges', href: '/compare' },
  { label: 'Scholarships',     href: '/scholarships' },
  { label: 'Programs',         href: '/programs' },
  { label: 'Education News',   href: '/news' },
  { label: 'Add Your College', href: '/submit-college' },
]

const universityLinks = [
  { label: 'TU Results',     href: '/results?university=TU' },
  { label: 'KU Results',     href: '/results?university=KU' },
  { label: 'NEB Results',    href: '/results?university=NEB' },
  { label: 'TU Notices',     href: '/notices?university=TU' },
  { label: 'KU Notices',     href: '/notices?university=KU' },
  { label: 'CTEVT Notices',  href: '/notices?university=CTEVT' },
]

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0d1b3e' }} className="text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* ── Col 1: Brand ─────────────────────────────── */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 mb-5">
              <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpenCheck className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-[17px] leading-none tracking-tight">
                <span className="text-white">Sikshya</span>
                <span className="text-blue-400">Nepal</span>
              </span>
            </Link>

            <p className="text-sm text-slate-400 leading-relaxed mb-6 max-w-xs">
              Nepal&apos;s verified education platform. Find schools and colleges, check
              results, and stay updated with official notices.
            </p>

            <div className="space-y-2.5 mb-6">
              <a
                href="mailto:info@sikshyanepal.com"
                className="flex items-center gap-2.5 text-sm text-slate-400 hover:text-white transition-colors duration-150"
              >
                <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                info@sikshyanepal.com
              </a>
              <div className="flex items-center gap-2.5 text-sm text-slate-400">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                Kathmandu, Nepal
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://twitter.com/sikshyanepal"
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all"
                aria-label="Twitter/X"
              >
                <TwitterIcon className="w-3.5 h-3.5 text-slate-400" />
              </a>
              <a
                href="https://facebook.com/sikshyanepal"
                target="_blank" rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all"
                aria-label="Facebook"
              >
                <FacebookIcon className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>

          {/* ── Col 2: Explore ───────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: Universities ──────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Universities
            </h3>
            <ul className="space-y-3">
              {universityLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors duration-150"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 4: Connect ───────────────────────────── */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-5">
              Connect
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Get daily alerts for results and notices from Nepal&apos;s top universities
              delivered straight to your inbox.
            </p>
            <Link
              href="/schools"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg
                         bg-[#1847c4] text-white text-sm font-semibold
                         hover:bg-[#1340b0] transition-colors"
            >
              Find a School
            </Link>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────── */}
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} SikshyaNepal. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-slate-500 sm:justify-end">
            <Link href="/about/editorial-policy" className="hover:text-white transition-colors duration-150">Editorial policy</Link>
            <Link href="/privacy" className="hover:text-white transition-colors duration-150">Privacy</Link>
            <Link href="/terms"   className="hover:text-white transition-colors duration-150">Terms</Link>
            <Link href="/community/guidelines" className="hover:text-white transition-colors duration-150">Community rules</Link>
            <Link href="/safety" className="hover:text-white transition-colors duration-150">Safety</Link>
            <Link href="/copyright" className="hover:text-white transition-colors duration-150">Copyright</Link>
            <Link href="/cookies" className="hover:text-white transition-colors duration-150">Cookies</Link>
            <Link href="/refunds" className="hover:text-white transition-colors duration-150">Refunds</Link>
            <CookieSettingsButton />
            <Link href="/contact" className="hover:text-white transition-colors duration-150">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
