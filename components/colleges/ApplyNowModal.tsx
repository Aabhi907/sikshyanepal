'use client'

import { useState, useEffect, FormEvent } from 'react'
import { X, Send, CheckCircle, Star, Loader2 } from 'lucide-react'

interface Program {
  name: string
}

interface Props {
  collegeName: string
  collegeId:   string
  isFeatured:  boolean
  programs:    Program[]
  onClose:     () => void
}

export default function ApplyNowModal({
  collegeName, collegeId, isFeatured, programs, onClose,
}: Props) {
  const [form, setForm] = useState({
    name:    '',
    phone:   '',
    email:   '',
    program: '',
    message: '',
  })
  const [loading,  setLoading]  = useState(false)
  const [success,  setSuccess]  = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [errors,   setErrors]   = useState<Record<string, string>>({})

  // Close on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', fn)
      document.body.style.overflow = ''
    }
  }, [onClose])

  function set(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setErrors(e => ({ ...e, [field]: '' }))
  }

  function validate() {
    const errs: Record<string, string> = {}
    if (!form.name.trim())    errs.name    = 'Full name is required'
    if (!form.phone.trim())   errs.phone   = 'Phone number is required'
    else if (!/^[9][6-9]\d{8}$|^\d{2}-\d{6,7}$/.test(form.phone.replace(/\s/g, '')))
      errs.phone = 'Enter a valid Nepali phone number'
    if (!form.program)        errs.program = 'Please select a program'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError(null)
    try {
      const res = await fetch('/api/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ ...form, college_id: collegeId, college_name: collegeName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Submission failed')
      setSuccess(true)
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full px-3.5 py-2.5 rounded-xl border text-sm text-ink placeholder-gray-400
     focus:outline-none focus:ring-2 focus:ring-[#1847c4]/20 focus:border-[#1847c4] transition-colors
     ${errors[field] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl
                      max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10 rounded-t-2xl">
          <div>
            <h2 className="font-display font-bold text-ink text-lg leading-tight"
                style={{ letterSpacing: '-0.02em' }}>
              Apply to {collegeName}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Fill your details — the college will contact you within 48 hours. Free.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="px-6 py-5">
          {/* Featured badge */}
          {isFeatured && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg mb-5 w-fit">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-semibold text-amber-700">Featured Partner College</span>
            </div>
          )}

          {success ? (
            /* ── Success state ─────────────────────────────── */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-display font-bold text-ink text-xl mb-2"
                  style={{ letterSpacing: '-0.02em' }}>
                Application Sent!
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-1">
                <span className="font-semibold text-ink">{collegeName}</span> will contact
                you within 48 hours on{' '}
                <span className="font-semibold text-[#1847c4]">{form.phone}</span>.
              </p>
              {form.email && (
                <p className="text-xs text-gray-400 mt-1">
                  Confirmation sent to {form.email}
                </p>
              )}
              <button
                onClick={onClose}
                className="mt-6 w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* ── Form ─────────────────────────────────────── */
            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="e.g. Ram Sharma"
                  className={inputClass('name')}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => set('phone', e.target.value)}
                  placeholder="98XXXXXXXX"
                  className={inputClass('phone')}
                />
                <p className="text-xs text-gray-400 mt-1">College will call you on this number</p>
                {errors.phone && <p className="text-xs text-red-500 mt-0.5">{errors.phone}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Email Address <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set('email', e.target.value)}
                  placeholder="youremail@example.com"
                  className={inputClass('email')}
                />
              </div>

              {/* Program */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Program Interested In <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.program}
                  onChange={e => set('program', e.target.value)}
                  className={inputClass('program')}
                >
                  <option value="">Select a program…</option>
                  {programs.map(p => (
                    <option key={p.name} value={p.name}>{p.name}</option>
                  ))}
                  <option value="Not sure yet">Not sure yet</option>
                </select>
                {errors.program && <p className="text-xs text-red-500 mt-1">{errors.program}</p>}
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Your Message <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value.slice(0, 300))}
                  rows={3}
                  placeholder="Any questions or specific requirements?"
                  className={inputClass('message') + ' resize-none'}
                />
                <p className="text-xs text-gray-400 mt-0.5 text-right">{form.message.length}/300</p>
              </div>

              {apiError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#1847c4]
                           text-white font-semibold rounded-xl hover:bg-[#1340b0]
                           disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                  : <><Send className="w-4 h-4" /> Send Application</>
                }
              </button>

              <p className="text-center text-xs text-gray-400">
                By applying you agree to be contacted by the college. We never share
                your details with third parties.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
