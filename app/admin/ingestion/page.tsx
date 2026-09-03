'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, Inbox, ShieldCheck, X } from 'lucide-react'

type Item = { id: string; title: string; target_type: string; scraper_name: string; source_url: string; fetched_at: string; quality_flags: string[]; status: string; payload: Record<string, unknown> }

export default function IngestionPage() {
  const [items, setItems] = useState<Item[]>([])
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState('')
  const load = () => fetch(`/api/admin/ingestion?status=${status}`, { cache: 'no-store' }).then(async r => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setItems(d) }).catch(e => setError(e.message))
  useEffect(() => { void load() }, [status]) // eslint-disable-line react-hooks/exhaustive-deps
  async function decide(item: Item, decision: 'approved' | 'rejected') {
    if (decision === 'approved' && !confirm(`Publish “${item.title}” to ${item.target_type}?`)) return
    const response = await fetch(`/api/admin/ingestion/${item.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: decision }) })
    const data = await response.json(); if (!response.ok) return setError(data.error || 'Review failed')
    setItems(all => all.filter(x => x.id !== item.id))
  }
  return <div className="p-8 text-gray-100"><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="flex items-center gap-2 text-2xl font-bold"><Inbox className="h-6 w-6 text-yellow-400" />Editorial ingestion queue</h1><p className="mt-1 text-sm text-gray-400">Nothing collected from the internet becomes public until an editor approves it.</p></div><select value={status} onChange={e => setStatus(e.target.value)} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm"><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option><option value="all">All</option></select></div>{error && <p className="mt-5 rounded-lg bg-red-950/50 p-3 text-red-300">{error}</p>}<div className="mt-6 grid gap-4 xl:grid-cols-2">{items.map(item => <article key={item.id} className="rounded-xl border border-gray-700 bg-gray-800 p-5"><div className="flex items-start justify-between gap-3"><div><span className="rounded bg-gray-700 px-2 py-1 text-[10px] font-bold uppercase text-cyan-300">{item.target_type}</span><h2 className="mt-2 font-semibold text-white">{item.title}</h2><p className="mt-1 text-xs text-gray-500">{item.scraper_name} · {new Date(item.fetched_at).toLocaleString()}</p></div><a href={item.source_url} target="_blank" rel="noopener noreferrer" className="rounded p-2 text-blue-400" title="Open original source"><ExternalLink className="h-4 w-4" /></a></div>{item.quality_flags?.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{item.quality_flags.map(flag => <span key={flag} className="rounded bg-amber-950/60 px-2 py-1 text-xs text-amber-300">{flag.replaceAll('_', ' ')}</span>)}</div>}{item.status === 'pending' && <div className="mt-5 flex gap-2"><button onClick={() => decide(item, 'approved')} className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" />Verify & publish</button><button onClick={() => decide(item, 'rejected')} className="flex items-center gap-1 rounded-lg bg-gray-700 px-3 py-2 text-sm"><X className="h-4 w-4" />Reject</button></div>}</article>)}</div>{!items.length && !error && <p className="py-20 text-center text-gray-500">No {status === 'all' ? '' : status} items.</p>}</div>
}
