'use client'

import { useState, useEffect } from 'react'
import { Star, Send, CheckCircle, Clock } from 'lucide-react'

interface ReviewFormProps {
  collegeId:   string
  collegeName: string
}

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
const LS_KEY      = (id: string) => `review_submitted_${id}`
const EXPIRY_MS   = 7 * 24 * 60 * 60 * 1000  // 7 days

export default function ReviewForm({ collegeId, collegeName }: ReviewFormProps) {
  const [form, setForm] = useState({
    student_name: '',
    program:      '',
    year:         '',
    rating:       0,
    review_text:  '',
  })
  const [hoverRating, setHoverRating] = useState(0)
  const [submitting,  setSubmitting]  = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')

  // Restore submitted state from localStorage (persists across refreshes)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(collegeId))
      if (raw) {
        const ts = parseInt(raw, 10)
        if (Date.now() - ts < EXPIRY_MS) {
          setSubmitted(true)
        } else {
          localStorage.removeItem(LS_KEY(collegeId))
        }
      }
    } catch {
      // localStorage not available (SSR guard)
    }
  }, [collegeId])

  const set = (field: string, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.rating === 0)           { setError('Please select a rating'); return }
    if (!form.student_name.trim())   { setError('Please enter your name'); return }
    if (form.review_text.length < 20) { setError('Review must be at least 20 characters'); return }

    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/reviews', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          ...form,
          college_id: collegeId,
          year: form.year ? parseInt(form.year, 10) : null,
        }),
      })

      if (res.ok) {
        // Persist submitted state so page refreshes don't show the form again
        try {
          localStorage.setItem(LS_KEY(collegeId), Date.now().toString())
        } catch {
          // ignore
        }
        setSubmitted(true)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to submit review')
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submitted state (shown across refreshes until 7-day expiry) ──────────
  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800 text-base mb-1">
              Thank you for your review!
            </h3>
            <p className="text-sm text-green-700 leading-relaxed mb-3">
              Your review of <strong>{collegeName}</strong> has been submitted and is pending admin approval.
            </p>
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-100 rounded-lg px-3 py-2 w-fit">
              <Clock className="w-3.5 h-3.5 flex-shrink-0" />
              Usually approved within 24 hours — then visible to all students
            </div>
            <button
              onClick={() => {
                try { localStorage.removeItem(LS_KEY(collegeId)) } catch {}
                setSubmitted(false)
              }}
              className="mt-3 text-xs text-green-700 hover:text-green-900 underline underline-offset-2"
            >
              Submit a different review
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Review form ───────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Overall Rating <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => set('rating', star)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  star <= (hoverRating || form.rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300 fill-gray-200'
                }`}
              />
            </button>
          ))}
          {(hoverRating || form.rating) > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-600">
              {STAR_LABELS[hoverRating || form.rating]}
            </span>
          )}
        </div>
      </div>

      {/* Name + Program */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.student_name}
            onChange={(e) => set('student_name', e.target.value)}
            placeholder="e.g. Ram Sharma"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Program Studied
          </label>
          <input
            type="text"
            value={form.program}
            onChange={(e) => set('program', e.target.value)}
            placeholder="e.g. BCA, BBA, +2 Science"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Year */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Year of Study / Batch
        </label>
        <input
          type="number"
          value={form.year}
          onChange={(e) => set('year', e.target.value)}
          placeholder="e.g. 2081, 2023"
          min="1990"
          max={new Date().getFullYear() + 1}
          className="w-full sm:w-40 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Review Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Your Review <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.review_text}
          onChange={(e) => set('review_text', e.target.value)}
          rows={5}
          placeholder="Share your experience — teaching quality, facilities, campus life, hostel, canteen, value for money..."
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className={`text-xs mt-1 ${form.review_text.length < 20 ? 'text-gray-400' : 'text-green-600'}`}>
          {form.review_text.length} characters
          {form.review_text.length < 20 && ' (minimum 20)'}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
        <p className="text-xs text-gray-400">Reviews appear after admin approval</p>
      </div>
    </form>
  )
}
