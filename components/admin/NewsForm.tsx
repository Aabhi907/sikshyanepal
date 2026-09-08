'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, ArrowLeft } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface NewsFormData { title: string; slug: string; content: string; image_url: string; published_date: string; author_name: string; source_name: string; source_url: string; status: 'draft' | 'published' | 'archived' }
const EMPTY: NewsFormData = { title: '', slug: '', content: '', image_url: '', published_date: new Date().toISOString().split('T')[0], author_name: 'SikshyaNepal Editorial', source_name: '', source_url: '', status: 'draft' }

interface Props { initialData?: Partial<NewsFormData>; newsId?: string; isEdit?: boolean }

export default function NewsForm({ initialData, newsId, isEdit = false }: Props) {
  const [form, setForm] = useState<NewsFormData>({ ...EMPTY, ...initialData })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const set = (field: keyof NewsFormData, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'title' && !isEdit) next.slug = slugify(value)
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch(isEdit ? `/api/admin/news/${newsId}` : '/api/admin/news', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) { router.push('/admin/news'); router.refresh() }
    else { const d = await res.json(); setError(d.error || 'Failed to save'); setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="p-8 text-gray-100 max-w-3xl">
      <div className="flex items-center gap-3 mb-8">
        <button type="button" onClick={() => router.back()} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Article' : 'Add News Article'}</h1>
      </div>
      {error && <div className="mb-5 p-3 bg-red-900/30 border border-red-700 rounded-lg text-red-400 text-sm">{error}</div>}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Title *</label>
          <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Slug</label>
          <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)}
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Original article summary *</label>
          <textarea value={form.content} onChange={e => set('content', e.target.value)} rows={10} required minLength={form.status === 'published' ? 200 : undefined}
            className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" />
          <p className="mt-1 text-xs text-gray-500">Published articles require at least 200 characters. Summarise in your own words; do not copy the source.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-gray-300">Author *</label><input value={form.author_name} onChange={e => set('author_name', e.target.value)} required className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white" /></div><div><label className="mb-1.5 block text-sm font-medium text-gray-300">Publishing status</label><select value={form.status} onChange={e => set('status', e.target.value)} className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1.5 block text-sm font-medium text-gray-300">Original source name *</label><input value={form.source_name} onChange={e => set('source_name', e.target.value)} required={form.status === 'published'} placeholder="Official university notice" className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white" /></div><div><label className="mb-1.5 block text-sm font-medium text-gray-300">Original source URL *</label><input type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)} required={form.status === 'published'} placeholder="https://official-source..." className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2.5 text-sm text-white" /></div></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Image URL</label>
            <input type="url" value={form.image_url} onChange={e => set('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Publish Date</label>
            <input type="date" value={form.published_date} onChange={e => set('published_date', e.target.value)}
              className="w-full px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-6">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : isEdit ? 'Update Article' : form.status === 'published' ? 'Publish Article' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => router.push('/admin/news')} className="px-4 py-2.5 text-gray-400 hover:text-white text-sm">Cancel</button>
      </div>
    </form>
  )
}
