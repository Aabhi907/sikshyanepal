'use client'

import { Plus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Option = { id: string; name: string; slug: string }

export default function SchoolComparePicker({ initial = [] }: { initial?: Option[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Option[]>(initial)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Option[]>([])

  useEffect(() => {
    if (query.trim().length < 2 || selected.length >= 3) return setResults([])
    const timer = window.setTimeout(() => {
      fetch(`/api/institutions?type=school&q=${encodeURIComponent(query)}`).then((response) => response.json()).then((data) => setResults(Array.isArray(data) ? data.filter((item: Option) => !selected.some((school) => school.id === item.id)) : []))
    }, 250)
    return () => window.clearTimeout(timer)
  }, [query, selected])

  function update(next: Option[]) {
    setSelected(next)
    const params = new URLSearchParams()
    next.forEach((school, index) => params.set(`school${index + 1}`, school.slug))
    router.push(`/schools/compare${params.size ? `?${params}` : ''}`)
  }

  return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-ink">Choose schools to compare</h2><p className="mt-1 text-sm text-gray-500">Select up to three schools. Information not published by a school remains clearly marked.</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-primary">{selected.length}/3 selected</span></div>
    <div className="mt-4 flex flex-wrap gap-2">{selected.map((school) => <span key={school.id} className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-2 text-sm font-semibold text-primary">{school.name}<button type="button" onClick={() => update(selected.filter((item) => item.id !== school.id))} aria-label={`Remove ${school.name}`}><X className="h-3.5 w-3.5" /></button></span>)}</div>
    {selected.length < 3 && <div className="relative mt-4"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a school by name" className="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-4 text-sm outline-none focus:border-primary" />{results.length > 0 && <div className="absolute z-10 mt-1 max-h-52 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">{results.map((school) => <button key={school.id} type="button" onClick={() => { update([...selected, school]); setQuery(''); setResults([]) }} className="flex w-full items-center gap-2 border-b border-gray-100 px-4 py-3 text-left text-sm hover:bg-blue-50"><Plus className="h-4 w-4 text-primary" />{school.name}</button>)}</div>}</div>}
  </section>
}
