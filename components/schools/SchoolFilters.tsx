'use client'

import Link from 'next/link'
import { Filter, Search, X } from 'lucide-react'
import { useState } from 'react'
import { districtsForProvince, NEPAL_PROVINCES } from '@/lib/nepal-geography'

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

export default function SchoolFilters({
  searchParams,
  districts,
  resultCount,
}: {
  searchParams: SchoolSearchParams
  districts: string[]
  resultCount: number
}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [province, setProvince] = useState(searchParams.province || '')
  const [district, setDistrict] = useState(searchParams.district || '')
  const provinceDistricts = province ? districtsForProvince(province) : districts
  const hasFilters = Object.values(searchParams).some(Boolean)
  const field = 'h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10'

  return (
    <aside className="rounded-2xl border border-gray-200 bg-white p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between lg:mb-5">
        <div className="flex items-center gap-2"><Filter className="h-4 w-4 text-primary" /><h2 className="text-sm font-bold text-ink">Find a school</h2></div>
        <div className="flex items-center gap-3">{hasFilters && <Link href="/schools" className="flex items-center gap-1 text-xs font-semibold text-red-500"><X className="h-3 w-3" />Clear</Link>}<button type="button" onClick={() => setMobileOpen(value => !value)} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-bold text-primary lg:hidden">{mobileOpen ? 'Hide filters' : 'Filters'}</button></div>
      </div>
      <form action="/schools" method="get" className={`mt-5 space-y-4 ${mobileOpen ? 'block' : 'hidden'} lg:block lg:mt-0`}>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">School name</span>
          <span className="relative block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input name="q" defaultValue={searchParams.q} placeholder="Search by name…" className={`${field} pl-9`} />
          </span>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">Province</span>
          <select name="province" value={province} onChange={(event) => { setProvince(event.target.value); setDistrict('') }} className={field}>
            <option value="">All provinces</option>
            {NEPAL_PROVINCES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-gray-500">District</span>
          <select name="district" value={district} onChange={(event) => setDistrict(event.target.value)} className={field} disabled={!province && provinceDistricts.length === 0}>
            <option value="">{province ? `All districts in ${province}` : 'Choose a province first'}</option>
            {provinceDistricts.map((d) => <option key={d}>{d}</option>)}
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
