'use client'

import { FormEvent, useEffect, useState } from 'react'

type Announcement = {
  id: string
  title: string
  message: string
  image_url: string | null
  link_url: string | null
  link_label: string | null
  placement: 'banner' | 'popup'
  is_active: boolean
}

const initialForm = {
  title: '',
  message: '',
  image_url: '',
  link_url: '',
  link_label: '',
  placement: 'banner',
  is_active: true,
}

export default function AnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([])
  const [form, setForm] = useState(initialForm)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    const response = await fetch('/api/admin/announcements')
    const data = await response.json()
    if (response.ok && Array.isArray(data)) setItems(data)
  }

  useEffect(() => {
    void load()
  }, [])

  const createAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError('')
    const response = await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await response.json()
    setIsSaving(false)
    if (!response.ok) {
      setError(data.error || 'Could not create this announcement.')
      return
    }
    setForm(initialForm)
    await load()
  }

  const toggleActive = async (announcement: Announcement) => {
    const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !announcement.is_active }),
    })
    if (!response.ok) return
    setItems((current) =>
      current.map((item) =>
        item.id === announcement.id ? { ...item, is_active: !item.is_active } : item,
      ),
    )
  }

  return (
    <main className="mx-auto max-w-5xl p-5 text-slate-900 sm:p-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Site controls</p>
        <h1 className="mt-1 text-3xl font-bold">Announcements & campaigns</h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Show verified notices, admission campaigns, or paid promotions as a slim banner or a dismissible popup.
        </p>
      </div>

      <form onSubmit={createAnnouncement} className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Title</span>
          <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Plus Two admissions are open" className="mt-1 w-full rounded-lg border border-slate-300 p-3" />
        </label>
        <label className="sm:col-span-2">
          <span className="text-sm font-medium">Message</span>
          <textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Keep it brief and useful for students." className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 p-3" />
        </label>
        <label>
          <span className="text-sm font-medium">Display type</span>
          <select value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value as 'banner' | 'popup' })} className="mt-1 w-full rounded-lg border border-slate-300 p-3">
            <option value="banner">Top banner</option>
            <option value="popup">Popup card</option>
          </select>
        </label>
        <label>
          <span className="text-sm font-medium">Image URL (optional)</span>
          <input type="url" value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} placeholder="https://…" className="mt-1 w-full rounded-lg border border-slate-300 p-3" />
        </label>
        <label>
          <span className="text-sm font-medium">Button link (optional)</span>
          <input type="url" value={form.link_url} onChange={(event) => setForm({ ...form, link_url: event.target.value })} placeholder="https://…" className="mt-1 w-full rounded-lg border border-slate-300 p-3" />
        </label>
        <label>
          <span className="text-sm font-medium">Button label</span>
          <input value={form.link_label} onChange={(event) => setForm({ ...form, link_label: event.target.value })} placeholder="Learn more" className="mt-1 w-full rounded-lg border border-slate-300 p-3" />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />
          Make active immediately
        </label>
        <div className="flex items-end justify-end">
          <button disabled={isSaving} className="rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white disabled:opacity-60">
            {isSaving ? 'Saving…' : 'Create announcement'}
          </button>
        </div>
        {error && <p className="sm:col-span-2 text-sm text-red-600">{error}</p>}
      </form>

      <section className="mt-8">
        <h2 className="text-xl font-bold">Existing announcements</h2>
        <div className="mt-3 space-y-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{item.title}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {item.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">{item.placement}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              </div>
              <button onClick={() => void toggleActive(item)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
                {item.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </article>
          ))}
          {!items.length && <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No announcements have been created yet.</p>}
        </div>
      </section>
    </main>
  )
}
