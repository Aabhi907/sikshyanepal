'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Check, X, EyeOff, ShieldAlert } from 'lucide-react'
import CommunityMedia from '@/components/community/CommunityMedia'

type Item = { id: string; title?: string; body?: string; topic?: string; status: string; created_at: string; media_url?: string | null; media_type?: 'image' | 'video' | null; post?: { title?: string }; author_id?: string | null; public_alias?: string | null }
type Report = { id: string; target_type: string; target_id: string; reason: string; details?: string; created_at: string }
type Data = { posts: Item[]; comments: Item[]; reports: Report[]; identities: Record<string, { email: string; provider: string }> }

export default function AdminCommunityPage() {
  const [data, setData] = useState<Data>({ posts: [], comments: [], reports: [], identities: {} })
  const [error, setError] = useState('')
  const load = () => fetch('/api/admin/community', { cache: 'no-store' }).then(async response => { const result = await response.json(); if (!response.ok) throw new Error(result.error); setData(result) }).catch(reason => setError(reason.message))
  useEffect(() => { void load() }, [])
  async function decide(type: 'post'|'comment'|'report'|'account', id: string, status: string) {
    const response = await fetch('/api/admin/community', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id, status }) })
    const result = await response.json()
    if (!response.ok) return setError(result.error || 'Update failed')
    void load()
  }
  const moderationItems = [...data.posts.map(item => ({ ...item, type: 'post' as const })), ...data.comments.map(item => ({ ...item, type: 'comment' as const }))]
  return <div className="p-8 text-gray-100">
    <h1 className="flex items-center gap-2 text-2xl font-bold"><MessageCircle className="h-6 w-6 text-cyan-400"/>Community moderation</h1>
    <p className="mt-1 text-sm text-gray-400">Public aliases protect students from each other. Account identity below is private and only for safety, enforcement and valid legal requests.</p>
    {error && <p className="mt-5 rounded bg-red-950/50 p-3 text-red-300">{error}</p>}
    <h2 className="mt-8 font-bold">Pending content ({moderationItems.length})</h2>
    <div className="mt-4 space-y-4">{moderationItems.map(item => <article key={`${item.type}-${item.id}`} className="rounded-xl border border-gray-700 bg-gray-800 p-5">
      <p className="text-xs font-bold uppercase text-cyan-300">{item.type} · {item.topic || item.post?.title || 'Discussion'}</p>
      <div className="mt-2 rounded-lg border border-gray-700 bg-gray-900/60 p-3 text-xs"><p><span className="text-gray-500">Public identity:</span> @{item.public_alias || 'LegacyStudent'}</p><p className="mt-1 break-all"><span className="text-gray-500">Private accountable account:</span> {item.author_id ? data.identities[item.author_id]?.email || item.author_id : 'Legacy anonymous submission'}</p></div>
      {item.title && <h3 className="mt-3 font-bold text-white">{item.title}</h3>}<p className="mt-3 whitespace-pre-line text-sm leading-6 text-gray-300">{item.body}</p>
      {item.media_url && <div className="mt-4 max-w-2xl"><CommunityMedia url={item.media_url} type={item.media_type}/></div>}
      <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => decide(item.type,item.id,'published')} className="inline-flex items-center gap-1 rounded bg-emerald-700 px-3 py-2 text-sm font-bold"><Check className="h-4 w-4"/>Publish</button><button onClick={() => decide(item.type,item.id,'rejected')} className="inline-flex items-center gap-1 rounded bg-red-900 px-3 py-2 text-sm"><X className="h-4 w-4"/>Reject</button><button onClick={() => decide(item.type,item.id,'hidden')} className="inline-flex items-center gap-1 rounded bg-gray-700 px-3 py-2 text-sm"><EyeOff className="h-4 w-4"/>Hide</button>{item.author_id && <button onClick={() => decide('account',item.author_id!,'suspended')} className="inline-flex items-center gap-1 rounded bg-amber-800 px-3 py-2 text-sm"><ShieldAlert className="h-4 w-4"/>Suspend account</button>}</div>
    </article>)}{!moderationItems.length && <p className="rounded-xl border border-gray-700 bg-gray-800 p-8 text-center text-gray-500">No posts or replies awaiting review.</p>}</div>
    <h2 className="mt-9 font-bold">Open reports ({data.reports.length})</h2><div className="mt-4 space-y-3">{data.reports.map(report => <article key={report.id} className="rounded-xl border border-amber-800/60 bg-amber-950/30 p-4"><p className="text-sm font-bold text-amber-200">{report.reason} · {report.target_type}</p>{report.details && <p className="mt-2 text-sm text-gray-300">{report.details}</p>}<div className="mt-3 flex flex-wrap gap-2"><button onClick={() => decide('report',report.id,'hide-target')} className="rounded bg-red-900 px-3 py-2 text-xs font-bold">Hide content</button><button onClick={() => decide('report',report.id,'resolved')} className="rounded bg-amber-700 px-3 py-2 text-xs font-bold">Resolve</button><button onClick={() => decide('report',report.id,'dismissed')} className="rounded bg-gray-700 px-3 py-2 text-xs">Dismiss</button></div></article>)}{!data.reports.length && <p className="text-sm text-gray-500">No open reports.</p>}</div>
  </div>
}
