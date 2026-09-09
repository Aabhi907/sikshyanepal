'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
type Item = { id: string; title?: string; body?: string; status: string; moderation_note?: string | null }

export default function MyCommunityContentPage() {
  const [data, setData] = useState<{ posts: Item[]; comments: Item[] }>({ posts: [], comments: [] })
  const [error, setError] = useState('')
  const load = async () => { const response = await fetch('/api/community/my-content', { cache: 'no-store' }); const result = await response.json(); if (!response.ok) setError(response.status === 401 ? 'Sign in with Google to manage your posts.' : result.error); else setData(result) }
  useEffect(() => { void load() }, [])
  async function remove(type: 'post'|'comment', id: string) { if (!window.confirm('Permanently delete this content?')) return; const response = await fetch('/api/community/my-content', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, id }) }); if (response.ok) void load(); else setError('Could not delete the content.') }
  const groups = [{ title: 'Your posts', type: 'post' as const, items: data.posts }, { title: 'Your replies', type: 'comment' as const, items: data.comments }]
  return <main className="min-h-screen bg-[#f6f7fb] px-4 py-10 sm:px-6"><div className="mx-auto max-w-3xl"><Link href="/community" className="text-sm font-bold text-primary">← Community</Link><h1 className="mt-5 font-display text-3xl font-extrabold text-ink">Your community activity</h1><p className="mt-2 text-sm text-gray-600">Review moderation status or permanently delete your own posts and replies. For an appeal, email safety@sikshyanepal.com.</p>{error && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">{error}</p>}{groups.map(group => <section key={group.type} className="mt-8"><h2 className="font-bold text-ink">{group.title}</h2><div className="mt-3 space-y-3">{group.items.map(item => <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold text-ink">{item.title || item.body?.slice(0, 100)}</p><p className="mt-1 text-xs font-bold uppercase text-gray-400">{item.status}</p>{item.moderation_note && <p className="mt-2 text-xs text-amber-700">Moderator note: {item.moderation_note}</p>}</div><button onClick={() => remove(group.type,item.id)} className="text-xs font-bold text-red-700 hover:underline">Delete</button></div></article>)}{!group.items.length && <p className="rounded-xl border border-dashed border-gray-300 p-5 text-sm text-gray-500">Nothing here yet.</p>}</div></section>)}</div></main>
}
