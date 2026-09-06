import Link from 'next/link'
import { Filter, Search, X } from 'lucide-react'

export type SchoolSearchParams = {
  q?: string
  province?: string
  district?: string
  ownership?: string
  level?: string
  medium?: string
  grade?: string
  verified?: string
}

const PROVINCES = ['Koshi', 'Madhesh', 'Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim']

export default function SchoolFilters({
  searchParams,
  districts,
  resultCount,
}: {
  searchParams: SchoolSearchParams
  districts: string[]
  resultCount: number
}) {
  const hasFilters = Object.values(searchParams).some(Boolean)
  const field = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-ink">Find a school</h2></div>
        {hasFilters && <Link href="/schools" className="flex items-center gap-1 text-xs font-semibold text-red-500"><X className="h-3 w-3" />Clear</Link>}
      </div>
      <form action="/schools" method="get" className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">School name</span>
          <span className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input name="q" defaultValue={searchParams.q} placeholder="Search by name…" className={`${field} pl-9`} />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">Province</span>
          <select name="province" defaultValue={searchParams.province || ''} className={field}>
            <option value="">All provinces</option>
            {PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">District</span>
          <select name="district" defaultValue={searchParams.district || ''} className={field}>
            <option value="">All districts</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">School type</span>
          <select name="ownership" defaultValue={searchParams.ownership || ''} className={field}>
            <option value="">All types</option>
            <option value="community">Community</option>
            <option value="institutional">Private / Institutional</option>
            <option value="public">Public</option>
            <option value="religious">Religious</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">Level</span>
          <select name="level" defaultValue={searchParams.level || ''} className={field}>
            <option value="">All levels</option>
            <option value="pre_primary">ECD / Pre-primary</option>
            <option value="basic">Basic (Grades 1–8)</option>
            <option value="secondary">Secondary (Grades 9–10)</option>
            <option value="multiple">Multiple levels (up to Grade 10)</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">Entry grade</span>
          <select name="grade" defaultValue={searchParams.grade || ''} className={field}>
            <option value="">Any grade range</option>
            <option value="0">ECD / pre-primary</option>
            {Array.from({ length: 10 }, (_, index) => index + 1).map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">Medium of instruction</span>
          <select name="medium" defaultValue={searchParams.medium || ''} className={field}>
            <option value="">Any medium</option>
            <option value="English">English</option>
            <option value="Nepali">Nepali</option>
            <option value="Both">English and Nepali</option>
          </select>
        </label>
        <label className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-600">
          <input type="checkbox" name="verified" value="true" defaultChecked={searchParams.verified === 'true'} className="h-4 w-4 accent-primary" />
          Verified information only
        </label>
        <button className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white transition hover:bg-primary-600">
          Show {resultCount.toLocaleString()} school{resultCount === 1 ? '' : 's'}
        </button>
      </form>
    </aside>
  )
}
