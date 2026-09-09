'use client'

import { FormEvent, useState } from 'react'
import { COMMUNITY_TOPICS } from '@/lib/community'
import CommunityIdentityGate from './CommunityIdentityGate'

function PostForm({ alias }: { alias: string }) {
  const [state, setState] = useState<'idle' | 'saving' | 'done'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setState('saving')
    setError('')
    const form = event.currentTarget
    const payload = new FormData(form)
    const response = await fetch('/api/community/posts', { method: 'POST', body: payload })
    const result = await response.json()
    if (!response.ok) {
      setError(result.error || 'Could not send your discussion.')
      setState('idle')
      return
    }
    form.reset()
    setState('done')
  }

  if (state === 'done') return <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5"><p className="font-bold text-emerald-950">Sent for review</p><p className="mt-1 text-sm leading-6 text-emerald-800">It will appear as @{alias} after moderation. Your Google identity remains private.</p><button onClick={() => setState('idle')} className="mt-3 text-sm font-bold text-emerald-900 underline">Start another discussion</button></div>

  return <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
    <h2 className="font-display text-xl font-bold text-ink">Start a discussion</h2>
    <p className="mt-1 text-sm leading-6 text-gray-500">Posting publicly as <strong>@{alias}</strong>. Your Google name and email are private. Do not include contact details, addresses or another person&apos;s private information.</p>
    <div className="mt-5 grid gap-4">
      <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Topic</span><select name="topic" required className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500">{COMMUNITY_TOPICS.map(topic => <option key={topic.value} value={topic.value}>{topic.label}</option>)}</select></label>
      <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Discussion title</span><input name="title" required minLength={10} maxLength={120} placeholder="Ask one clear question or share a useful experience" className="w-full rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-blue-500" /></label>
      <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">What do you want to share?</span><textarea name="body" maxLength={2000} rows={6} placeholder="Add context for other students. Text must be at least 30 characters unless you attach a photo or video." className="w-full resize-y rounded-xl border border-gray-200 px-3 py-3 text-sm leading-6 outline-none focus:border-blue-500" /></label>
      <label><span className="mb-1.5 block text-sm font-semibold text-gray-700">Photo or short video <span className="font-normal text-gray-400">(optional)</span></span><input name="media" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" className="block w-full rounded-xl border border-gray-200 bg-gray-50 p-2 text-xs text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:font-bold file:text-blue-700"/><span className="mt-1.5 block text-xs text-gray-400">Images up to 5 MB · MP4/WebM videos up to 30 MB. Media is reviewed before the post appears.</span></label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button disabled={state === 'saving'} className="mt-5 w-full rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{state === 'saving' ? 'Sending safely…' : 'Submit for moderation'}</button>
  </form>
}

export default function NewPostForm() {
  return <CommunityIdentityGate>{alias => <PostForm alias={alias}/>}</CommunityIdentityGate>
}
