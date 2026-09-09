'use client'

import { FormEvent, useState } from 'react'
import CommunityIdentityGate from './CommunityIdentityGate'

function Form({ postId, alias }: { postId: string; alias: string }) {
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle')
  const [error, setError] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState('saving'); setError('')
    const form = event.currentTarget
    const payload = Object.fromEntries(new FormData(form))
    const response = await fetch(`/api/community/posts/${postId}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const result = await response.json()
    if (!response.ok) { setError(result.error || 'Could not send your reply.'); setState('idle'); return }
    form.reset(); setState('done')
  }
  if (state === 'done') return <p className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">Reply sent for moderation. It will appear after review.</p>
  return <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Reply as @{alias}</h2><p className="mt-1 text-xs leading-5 text-gray-500">Be helpful. Your account details stay private. Do not share contact details or identify another student.</p><textarea name="body" required minLength={2} maxLength={1000} rows={4} className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-sm leading-6 outline-none focus:border-blue-500" placeholder="Write a respectful reply…"/><input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true"/>{error&&<p className="mt-3 text-sm text-red-700">{error}</p>}<button disabled={state==='saving'} className="mt-3 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">{state==='saving'?'Sending…':'Submit reply'}</button></form>
}

export default function ReplyForm({ postId }: { postId: string }) {
  return <CommunityIdentityGate>{alias => <Form postId={postId} alias={alias}/>}</CommunityIdentityGate>
}
