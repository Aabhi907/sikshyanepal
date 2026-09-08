'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Bookmark, GitCompare, Loader2, MapPin, Trash2 } from 'lucide-react'
import { cleanCollegeText } from '@/lib/college-display'

type Saved = {
  college_id: string
  college: {
    id: string
    name: string
    slug: string
    location: string
    affiliation: string | null
    education_levels: string[] | null
    verification_status: string
  } | null
}

const levelLabel = (level: string) => level === 'plus_two' ? '+2' : level.charAt(0).toUpperCase() + level.slice(1)

export default function SavedPage() {
  const [items, setItems] = useState<Saved[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [needsLogin, setNeedsLogin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/saved-colleges', { cache: 'no-store', signal: controller.signal })
      .then(async response => {
        if (response.status === 401) { setNeedsLogin(true); return [] }
        if (!response.ok) throw new Error('Your shortlist could not be loaded.')
        return response.json()
      })
      .then(data => { if (Array.isArray(data)) setItems(data.filter(item => item.college)) })
      .catch(fetchError => {
        if (fetchError instanceof Error && fetchError.name !== 'AbortError') setError(fetchError.message)
      })
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [])

  const compareUrl = useMemo(() => {
    const params = new URLSearchParams()
    selected.forEach((slug, index) => params.set(`college${index + 1}`, slug))
    return `/compare?${params.toString()}`
  }, [selected])

  const toggleSelection = (slug: string) => {
    setSelected(current => current.includes(slug) ? current.filter(item => item !== slug) : current.length < 3 ? [...current, slug] : current)
  }

  const remove = async (item: Saved) => {
    setRemoving(item.college_id)
    setError('')
    try {
      const response = await fetch(`/api/saved-colleges/${item.college_id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('This college could not be removed. Please try again.')
      setItems(current => current.filter(saved => saved.college_id !== item.college_id))
      if (item.college) setSelected(current => current.filter(slug => slug !== item.college!.slug))
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : 'This college could not be removed.')
    } finally {
      setRemoving(null)
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold text-ink"><Bookmark className="h-7 w-7 text-blue-600" />Saved colleges</h1>
          <p className="mt-2 text-gray-500">Build a realistic shortlist, then compare programs, fees and admissions.</p>
        </div>
        {items.length >= 2 && (
          <Link href={selected.length >= 2 ? compareUrl : '#saved-list'} aria-disabled={selected.length < 2} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${selected.length >= 2 ? 'bg-primary text-white hover:bg-blue-700' : 'cursor-not-allowed bg-gray-100 text-gray-400'}`}>
            <GitCompare className="h-4 w-4" />Compare selected ({selected.length}/3)
          </Link>
        )}
      </div>

      {error && <p role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</p>}

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 rounded-2xl border bg-white p-12 text-sm text-gray-500"><Loader2 className="h-5 w-5 animate-spin" />Loading your shortlist…</div>
      ) : needsLogin ? (
        <div className="mt-8 rounded-2xl border bg-white p-8 text-center"><p>Sign in to see and save your college shortlist.</p><Link href="/account/login?next=/account/saved" className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-white">Sign in</Link></div>
      ) : (
        <div id="saved-list" className="mt-8 space-y-3">
          {items.map(item => item.college && (
            <article key={item.college_id} className={`rounded-2xl border bg-white p-5 transition ${selected.includes(item.college.slug) ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}`}>
              <div className="flex items-start gap-3">
                <label className="mt-1 flex cursor-pointer items-center" title="Select for comparison">
                  <input type="checkbox" checked={selected.includes(item.college.slug)} disabled={!selected.includes(item.college.slug) && selected.length >= 3} onChange={() => toggleSelection(item.college!.slug)} className="h-4 w-4 accent-primary" />
                  <span className="sr-only">Compare {item.college.name}</span>
                </label>
                <div className="min-w-0 flex-1">
                  <Link href={`/colleges/${item.college.slug}`} className="font-display text-lg font-bold text-ink hover:text-primary">{item.college.name}</Link>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3.5 w-3.5 shrink-0" />{cleanCollegeText(item.college.location) || 'Location not listed'}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {cleanCollegeText(item.college.affiliation) && <span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">{cleanCollegeText(item.college.affiliation)}</span>}
                    {(item.college.education_levels || []).map(level => <span key={level} className="rounded-full bg-blue-50 px-2.5 py-1 font-semibold text-blue-700">{levelLabel(level)}</span>)}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row">
                  <Link href={`/colleges/${item.college.slug}`} className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-bold text-primary hover:border-blue-300">View profile</Link>
                  <button type="button" onClick={() => void remove(item)} disabled={removing === item.college_id} aria-label={`Remove ${item.college.name} from saved colleges`} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
          {!items.length && <div className="rounded-2xl border bg-white p-10 text-center"><Bookmark className="mx-auto h-10 w-10 text-gray-200" /><h2 className="mt-3 font-display text-xl font-bold text-ink">Your shortlist is empty</h2><p className="mt-2 text-sm text-gray-500">Save colleges from their profile pages to compare realistic options here.</p><Link href="/colleges" className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Explore colleges</Link></div>}
        </div>
      )}
      {items.length >= 2 && <p className="mt-4 text-xs text-gray-500">Select two or three colleges to compare them side by side.</p>}
    </main>
  )
}
