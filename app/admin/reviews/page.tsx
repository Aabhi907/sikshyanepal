'use client'

import { useEffect, useState } from 'react'
import { Star, Check, X, Trash2, BadgeCheck } from 'lucide-react'
import { formatDateShort } from '@/lib/utils'
import ConfirmDialog, { ConfirmState, CONFIRM_CLOSED } from '@/components/ui/ConfirmDialog'
import { ToastList, useToast } from '@/components/ui/Toast'

interface Review {
  id: string
  student_name: string
  rating: number
  review_text: string
  program: string | null
  year: number | null
  is_approved: boolean
  verification_status?: 'unverified' | 'submitted' | 'verified' | 'rejected'
  created_at: string
  college?: { name: string; slug: string } | null
}

export default function AdminReviewsPage() {
  const [reviews,  setReviews]  = useState<Review[]>([])
  const [loading,  setLoading]  = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [filter,   setFilter]   = useState<'pending' | 'approved' | 'all'>('pending')
  const [dialog,   setDialog]   = useState<ConfirmState>(CONFIRM_CLOSED)
  const { toasts, toast, dismiss } = useToast()

  function loadReviews() {
    setLoading(true)
    fetch(`/api/admin/reviews?t=${Date.now()}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!Array.isArray(d)) { toast.error(d?.error || 'Failed to load reviews'); setLoading(false); return }
        setReviews(d)
        setLoading(false)
      })
      .catch(() => { toast.error('Failed to load reviews'); setLoading(false) })
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadReviews() }, [])

  const updateReview = async (id: string, is_approved: boolean, verification_status?: Review['verification_status']) => {
    setUpdating(id)
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_approved, ...(verification_status ? { verification_status } : {}) }),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error || `Server error ${res.status}`)
        return
      }
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, is_approved, ...(verification_status ? { verification_status } : {}) } : r))
      toast.success(is_approved ? 'Review approved — now visible on college profile' : 'Review unapproved')
    } catch {
      toast.error('Network error — review not updated')
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = (id: string) => {
    setDialog({
      isOpen: true,
      title: 'Delete Review',
      message: 'Delete this review permanently? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        setDialog(CONFIRM_CLOSED)
        setUpdating(id)
        try {
          const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' })
          if (!res.ok) {
            const err = await res.json()
            toast.error(err.error || 'Failed to delete')
            return
          }
          setReviews((prev) => prev.filter((r) => r.id !== id))
          toast.success('Review deleted')
        } catch {
          toast.error('Network error — review not deleted')
        } finally {
          setUpdating(null)
        }
      },
    })
  }

  const filtered = reviews.filter((r) =>
    filter === 'all' ? true : filter === 'pending' ? !r.is_approved : r.is_approved
  )
  const pending = reviews.filter((r) => !r.is_approved).length

  return (
    <div className="p-8 text-gray-100">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Star className="w-6 h-6 text-yellow-400" /> Student Reviews
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {pending > 0 && (
            <span className="text-orange-400 font-medium">{pending} pending approval — </span>
          )}
          {reviews.length} total
        </p>
      </div>

      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
            }`}
          >
            {f === 'pending'
              ? `Pending (${pending})`
              : f === 'approved'
              ? `Approved (${reviews.filter((r) => r.is_approved).length})`
              : `All (${reviews.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
              {filter === 'pending' ? 'No pending reviews 🎉' : 'No reviews found'}
            </div>
          ) : (
            filtered.map((review) => (
              <div
                key={review.id}
                className={`bg-gray-800 rounded-xl border p-5 transition-colors ${
                  !review.is_approved ? 'border-orange-700/50' : 'border-gray-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-300">
                        {review.student_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-white text-sm">{review.student_name}</p>
                        <p className="text-xs text-gray-500">
                          {review.college?.name}
                          {review.program && ` • ${review.program}`}
                          {review.year && ` • ${review.year}`}
                        </p>
                      </div>
                      {review.verification_status === 'submitted' && <span className="rounded bg-amber-900/50 px-2 py-1 text-[10px] font-bold uppercase text-amber-300">Evidence submitted</span>}
                      {review.verification_status === 'verified' && <span className="inline-flex items-center gap-1 rounded bg-blue-900/50 px-2 py-1 text-[10px] font-bold uppercase text-blue-300"><BadgeCheck className="h-3 w-3" />Verified student</span>}
                      <div className="flex items-center gap-0.5 ml-auto">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= review.rating
                                ? 'text-yellow-400 fill-yellow-400'
                                : 'text-gray-600 fill-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">{review.review_text}</p>
                    <p className="text-xs text-gray-600 mt-2">{formatDateShort(review.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {!review.is_approved ? (
                      <button
                        onClick={() => updateReview(review.id, true)}
                        disabled={updating === review.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Check className="w-3 h-3" />
                        {updating === review.id ? '…' : 'Approve'}
                      </button>
                    ) : (
                      <button
                        onClick={() => updateReview(review.id, false)}
                        disabled={updating === review.id}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        <X className="w-3 h-3" />
                        {updating === review.id ? '…' : 'Unapprove'}
                      </button>
                    )}
                    {review.verification_status === 'submitted' && <button onClick={() => updateReview(review.id, review.is_approved, 'verified')} disabled={updating === review.id} className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"><BadgeCheck className="w-3 h-3" />Verify</button>}
                    <button
                      onClick={() => handleDelete(review.id)}
                      disabled={updating === review.id}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <ConfirmDialog {...dialog} onCancel={() => setDialog(CONFIRM_CLOSED)} />
      <ToastList toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
