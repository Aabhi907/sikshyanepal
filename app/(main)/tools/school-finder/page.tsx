'use client'

import Link from 'next/link'
import { ArrowRight, Compass, RotateCcw, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { districtsForProvince, NEPAL_PROVINCES } from '@/lib/nepal-geography'

const provinces = ['Any province', ...NEPAL_PROVINCES]
const grades = [{ label: 'ECD / pre-primary', value: '0' }, ...Array.from({ length: 10 }, (_, index) => ({ label: `Grade ${index + 1}`, value: String(index + 1) }))]
const types = [{ label: 'Any school type', value: '' }, { label: 'Community', value: 'community' }, { label: 'Private / Institutional', value: 'institutional' }, { label: 'Public', value: 'public' }, { label: 'Religious', value: 'religious' }]
const mediums = [{ label: 'Any medium', value: '' }, { label: 'English', value: 'English' }, { label: 'Nepali', value: 'Nepali' }, { label: 'English and Nepali', value: 'Both' }]

export default function SchoolFinderPage() {
  const [grade, setGrade] = useState('1')
  const [province, setProvince] = useState('Any province')
  const [district, setDistrict] = useState('')
  const [ownership, setOwnership] = useState('')
  const [medium, setMedium] = useState('')
  const [verified, setVerified] = useState(true)
  const availableDistricts = province === 'Any province' ? [] : districtsForProvince(province)
  const destination = useMemo(() => {
    const search = new URLSearchParams({ grade })
    if (province !== 'Any province') search.set('province', province)
    if (district.trim()) search.set('district', district.trim())
    if (ownership) search.set('ownership', ownership)
    if (medium) search.set('medium', medium)
    if (verified) search.set('verified', 'true')
    return `/schools?${search}`
  }, [district, grade, medium, ownership, province, verified])
  const field = 'mt-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-ink outline-none focus:border-primary'

  return <div className="min-h-screen bg-[#f0f4ff]"><section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-4xl px-4 py-12 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Parent tool</p><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">Find schools that fit your child</h1><p className="mt-3 max-w-2xl text-gray-500">Choose the entry grade and practical preferences. We’ll prepare a school-directory search for ECD through Grade 10 only.</p></div></section><main className="mx-auto grid max-w-4xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_300px]"><section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold text-ink">Your preferences</h2><button onClick={() => { setGrade('1'); setProvince('Any province'); setDistrict(''); setOwnership(''); setMedium(''); setVerified(true) }} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary"><RotateCcw className="h-4 w-4" />Reset</button></div><div className="mt-7 space-y-6"><div><h3 className="text-sm font-bold text-ink">Which grade will your child enter?</h3><div className="mt-3 flex flex-wrap gap-2">{grades.map((option) => <button key={option.value} onClick={() => setGrade(option.value)} className={`rounded-xl border px-3 py-2 text-sm font-semibold ${grade === option.value ? 'border-primary bg-primary text-white' : 'border-gray-200 text-gray-600 hover:border-blue-300 hover:text-primary'}`}>{option.label}</button>)}</div></div><div className="grid gap-5 sm:grid-cols-2"><label><span className="text-sm font-bold text-ink">Preferred province</span><select value={province} onChange={(event) => { setProvince(event.target.value); setDistrict('') }} className={field}>{provinces.map((option) => <option key={option}>{option}</option>)}</select></label><label><span className="text-sm font-bold text-ink">District (optional)</span><select value={district} onChange={(event) => setDistrict(event.target.value)} disabled={province === 'Any province'} className={`${field} disabled:bg-gray-50 disabled:text-gray-400`}><option value="">{province === 'Any province' ? 'Choose province first' : `All districts in ${province}`}</option>{availableDistricts.map(option => <option key={option}>{option}</option>)}</select></label><label><span className="text-sm font-bold text-ink">School type</span><select value={ownership} onChange={(event) => setOwnership(event.target.value)} className={field}>{types.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label><label><span className="text-sm font-bold text-ink">Medium of instruction</span><select value={medium} onChange={(event) => setMedium(event.target.value)} className={field}>{mediums.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label></div><label className="flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-sm text-blue-950"><input type="checkbox" checked={verified} onChange={(event) => setVerified(event.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" /><span><strong>Show verified information only</strong><span className="mt-1 block text-blue-800/75">Verification means the published profile has a documented source or institution confirmation.</span></span></label></div></section><aside className="space-y-5"><section className="rounded-2xl bg-[#0d1b3e] p-6 text-white"><Compass className="h-6 w-6 text-blue-300" /><h2 className="mt-5 font-display text-xl font-bold">Your school search is ready</h2><p className="mt-2 text-sm leading-6 text-blue-100/75">Browse matching schools, then compare the profiles and contact each school to confirm admission availability.</p><Link href={destination} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-primary hover:bg-blue-50"><Search className="h-4 w-4" />See matching schools <ArrowRight className="h-4 w-4" /></Link></section><section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><h2 className="font-bold">Before you enrol</h2><p className="mt-2">Confirm admissions, fees, transport, learning support, and the current grade availability directly with the school. This tool helps discovery; it does not guarantee a seat.</p></section></aside></main></div>
}
