'use client'

import { Plus, Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

type Option = { id: string; name: string; slug: string; local_level?: string | null; district?: string | null; province?: string | null }

export default function SchoolComparePicker({ initial = [] }: { initial?: Option[] }) {
  const router = useRouter()
  const [selected, setSelected] = useState<Option[]>(initial)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Option[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2 || selected.length >= 3) {
      setResults([]); setLoading(false); setSearched(false); setError('')
      return
    }
    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true); setSearched(false); setError('')
      try {
        const response = await fetch(`/api/institutions?type=school&q=${encodeURIComponent(term)}`, { signal: controller.signal })
        if (!response.ok) throw new Error('Search unavailable')
        const data = await response.json()
        setResults(Array.isArray(data) ? data.filter((item: Option) => !selected.some((school) => school.id === item.id)) : [])
        setSearched(true)
      } catch (reason) {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) setError('Could not search schools. Please try again.')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 250)
    return () => { window.clearTimeout(timer); controller.abort() }
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
    {selected.length < 3 && <div className="relative mt-4"><Search className="absolute left-3 top-[22px] h-4 w-4 -translate-y-1/2 text-gray-400" /><input role="combobox" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search a school by name" aria-label="Search a school to compare" aria-autocomplete="list" aria-controls="school-compare-results" aria-expanded={results.length > 0} className="h-11 w-full rounded-xl border border-gray-200 pl-9 pr-20 text-sm outline-none focus:border-primary" />{loading && <span className="absolute right-3 top-[22px] -translate-y-1/2 text-xs text-gray-400">Searching…</span>}{results.length > 0 && <div id="school-compare-results" role="listbox" className="absolute z-10 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg">{results.map((school) => { const place = [school.local_level, school.district, school.province].filter(Boolean).join(', '); return <button key={school.id} type="button" role="option" aria-selected="false" onClick={() => { update([...selected, school]); setQuery(''); setResults([]) }} className="flex w-full items-start gap-2 border-b border-gray-100 px-4 py-3 text-left hover:bg-blue-50"><Plus className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span><span className="block text-sm font-semibold text-ink">{school.name}</span>{place && <span className="mt-0.5 block text-xs text-gray-500">{place}</span>}</span></button> })}</div>}{!loading && searched && !results.length && !error && <p className="mt-2 text-xs text-gray-500">No matching active schools found. Try a shorter name.</p>}{error && <p role="alert" className="mt-2 text-xs text-red-600">{error}</p>}</div>}
  </section>
}
