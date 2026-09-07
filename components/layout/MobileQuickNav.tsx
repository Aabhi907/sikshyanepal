'use client'

import Link from 'next/link'
import { Building2, CalendarDays, House, School, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'

const items = [
  { href: '/', label: 'Home', Icon: House },
  { href: '/schools', label: 'Schools', Icon: School },
  { href: '/admissions', label: 'Admissions', Icon: CalendarDays },
  { href: '/colleges', label: 'Colleges', Icon: Building2 },
  { href: '/search', label: 'Search', Icon: Search },
]

export default function MobileQuickNav() {
  const pathname = usePathname()
  return <nav aria-label="Quick navigation" className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"><div className="mx-auto grid max-w-lg grid-cols-5">{items.map(({ href, label, Icon }) => { const active = href === '/' ? pathname === '/' : pathname.startsWith(href); return <Link key={href} href={href} aria-current={active?'page':undefined} className={`flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-bold transition ${active ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}><span className={`flex h-7 w-9 items-center justify-center rounded-xl ${active ? 'bg-blue-50' : ''}`}><Icon className="h-4 w-4" /></span>{label}</Link> })}</div></nav>
}
