'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Trash2, Bell } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import ConfirmDialog, { ConfirmState, CONFIRM_CLOSED } from '@/components/ui/ConfirmDialog'
import { ToastList, useToast } from '@/components/ui/Toast'

interface NoticeItem {
  id: string
  title: string
  slug: string
  published_date: string
  university?: { short_name: string }
}

export default function AdminNoticesPage() {
  const [items,   setItems]   = useState<NoticeItem[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState<string | null>(null)
  const [dialog,  setDialog]  = useState<ConfirmState>(CONFIRM_CLOSED)
  const { toasts, toast, dismiss } = useToast()

  useEffect(() => {
    fetch(`/api/admin/notices?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => { setItems(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => { toast.error('Failed to load notices'); setLoading(false) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDelete = (id: string, title: string) => {
    setDialog({
      isOpen: true,
      title: 'Delete Notice',
      message: `Delete "${title}"? This cannot be undone.`,
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setDialog(CONFIRM_CLOSED)
        setWorking(id)
        try {
          const res = await fetch(`/api/admin/notices/${id}`, { method: 'DELETE' })
          if (!res.ok) { toast.error('Failed to delete notice'); return }
          setItems((prev) => prev.filter((n) => n.id !== id))
          toast.success('Notice deleted')
        } catch {
          toast.error('Network error — notice not deleted')
        } finally {
          setWorking(null)
        }
      },
    })
  }

  return (
    <div className="p-8 text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-yellow-400" /> Notices
          </h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} notices</p>
        </div>
        <Link
          href="/admin/notices/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Notice
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : (
        <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-5 py-3 text-gray-400 font-medium">Title</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium hidden md:table-cell">University</th>
                <th className="text-left px-5 py-3 text-gray-400 font-medium hidden md:table-cell">Published</th>
                <th className="text-right px-5 py-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10 text-gray-500">
                    No notices.{' '}
                    <Link href="/admin/notices/new" className="text-blue-400 hover:underline">Add one</Link>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-700/50">
                    <td className="px-5 py-3">
                      <div className="font-medium text-white line-clamp-1">{item.title}</div>
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">
                      {item.university?.short_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 hidden md:table-cell">
                      {formatDateShort(item.published_date)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/notices/${item.id}/edit`}
                          className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id, item.title)}
                          disabled={working === item.id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-700 rounded transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog {...dialog} onCancel={() => setDialog(CONFIRM_CLOSED)} />
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
