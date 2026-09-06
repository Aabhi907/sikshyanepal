'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Inbox, PencilLine, ShieldCheck, X } from 'lucide-react'

type Item = { id: string; title: string; target_type: string; scraper_name: string; source_url: string; fetched_at: string; quality_flags: string[]; status: string; payload: Record<string, unknown>; reviewer_notes?: string | null }

const stringify = (payload: Record<string, unknown>) => JSON.stringify(payload || {}, null, 2)

export default function IngestionPage() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState('pending')
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState<Record<string, boolean>>({})
  const [error, setError] = useState('')

  const load = () => fetch(`/api/admin/ingestion?status=${status}`, { cache: 'no-store' }).then(async response => {
    const data = await response.json()
    if (!response.ok) throw new Error(data.error)
    setItems(data)
    setDrafts(Object.fromEntries(data.map((item: Item) => [item.id, stringify(item.payload)])))
  }).catch(reason => setError(reason.message))

  useEffect(() => { void load() }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  async function decide(item: Item, decision: 'approved' | 'rejected') {
    setError('')
    let payload: Record<string, unknown> | undefined
    if (decision === 'approved') {
      try { payload = JSON.parse(drafts[item.id] || stringify(item.payload)) as Record<string, unknown> } catch { setError(`The extracted data for “${item.title}” is not valid JSON.`); return }
      if (Array.isArray(payload) || typeof payload !== 'object' || !payload) { setError('Extracted data must be a JSON object.'); return }
      if (!confirm(`Publish “${String(payload.title || item.title)}” to ${item.target_type}?`)) return
    }
    const response = await fetch(`/api/admin/ingestion/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: decision, reviewer_notes: notes[item.id] || '', payload }) })
    const data = await response.json()
    if (!response.ok) return setError(data.error || 'Review failed')
    setItems(all => all.filter(current => current.id !== item.id))
  }

  return <div className="p-8 text-gray-100">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="flex items-center gap-2 text-2xl font-bold"><Inbox className="h-6 w-6 text-yellow-400" />Editorial ingestion queue</h1><p className="mt-1 text-sm text-gray-400">Nothing collected from the internet becomes public until an editor checks the original source and approves it.</p></div>
      <select value={status} onChange={event => setStatus(event.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option></select>
    </div>
    {error && <p className="mt-5 rounded-lg bg-red-950/50 p-3 text-red-300">{error}</p>}
    <div className="mt-6 grid gap-4 xl:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <div className="flex items-start justify-between gap-3"><div><span className="rounded bg-gray-700 px-2 py-1 text-[10px] font-bold uppercase text-cyan-300">{item.target_type}</span><h2 className="mt-2 font-semibold text-white">{item.title}</h2><p className="mt-1 text-xs text-gray-500">{item.scraper_name} · {new Date(item.fetched_at).toLocaleString()}</p></div><a href={item.source_url} target="_blank" rel="noopener noreferrer" className="rounded p-2 text-blue-400" title="Open original source"><ExternalLink className="h-4 w-4" /></a></div>
      {item.quality_flags?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{item.quality_flags.map(flag => <span key={flag} className="rounded bg-amber-950/60 px-2 py-1 text-xs text-amber-300">{flag.replaceAll('_', ' ')}</span>)}</div>}
      <details className="mt-4 rounded-lg border border-gray-700 bg-gray-900/60 p-3"><summary className="cursor-pointer text-xs font-semibold text-gray-300">Inspect extracted fields</summary><pre className="mt-3 max-h-52 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-gray-300">{drafts[item.id] || stringify(item.payload)}</pre></details>
      {item.status === 'pending' && <><details className="mt-3 rounded-lg border border-gray-700 bg-gray-900/60 p-3"><summary onClick={() => setEditing(all => ({ ...all, [item.id]: !all[item.id] }))} className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-cyan-300"><PencilLine className="h-3.5 w-3.5" />Edit extracted data before publishing</summary>{editing[item.id] && <textarea aria-label={`Edit extracted data for ${item.title}`} value={drafts[item.id] || stringify(item.payload)} onChange={event => setDrafts(all => ({ ...all, [item.id]: event.target.value }))} spellCheck={false} className="mt-3 min-h-52 w-full rounded border border-gray-700 bg-gray-950 p-3 font-mono text-xs leading-5 text-gray-200" />}</details><textarea value={notes[item.id] || ''} onChange={event => setNotes(all => ({ ...all, [item.id]: event.target.value }))} maxLength={2000} placeholder="Optional reviewer note (why this was approved or rejected)" className="mt-4 min-h-16 w-full rounded-lg border border-gray-700 bg-gray-900 p-2 text-xs text-gray-200 placeholder:text-gray-600" /><div className="mt-3 flex gap-2"><button onClick={() => decide(item, 'approved')} className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" />Verify & publish</button><button onClick={() => decide(item, 'rejected')} className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-sm"><X className="h-4 w-4" />Reject</button></div></>}
      {item.reviewer_notes && <p className="mt-4 rounded-lg bg-gray-900 p-3 text-xs text-gray-400"><span className="font-semibold text-gray-300">Reviewer note:</span> {item.reviewer_notes}</p>}
    </article>)}</div>
    {!items.length && !error && <p className="py-20 text-center text-gray-500">No {status === 'all' ? '' : status} items.</p>}
  </div>
}
