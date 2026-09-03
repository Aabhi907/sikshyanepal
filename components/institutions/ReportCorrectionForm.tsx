'use client'

import { useState } from 'react'
import { CheckCircle2, Flag, Loader2, X } from 'lucide-react'

export default function ReportCorrectionForm({
  entityType,
  entityId,
  entityName,
}: {
  entityType: 'school' | 'college'
  entityId: string
  entityName: string
}) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const form = new FormData(e.currentTarget)
    const response = await fetch('/api/report-correction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        correction_type: form.get('correction_type'),
        details: form.get('details'),
        source_url: form.get('source_url'),
        reporter_name: form.get('reporter_name'),
        reporter_email: form.get('reporter_email'),
        reporter_role: form.get('reporter_role'),
        website: form.get('website'),
      }),
    })
    const payload = await response.json()
    setSaving(false)
    if (!response.ok) return setError(payload.error || 'Could not submit your report.')
    setSuccess(true)
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary">
        <Flag className="h-4 w-4" /> Report incorrect information
      </button>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Report incorrect information">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl sm:p-8">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div><h2 className="font-display text-xl font-bold text-ink">Help us keep this accurate</h2><p className="mt-1 text-sm text-gray-500">Report a correction for {entityName}.</p></div>
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"><X className="h-5 w-5" /></button>
            </div>
            {success ? (
              <div className="py-10 text-center"><CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-500" /><h3 className="font-bold text-ink">Report received</h3><p className="mt-2 text-sm text-gray-500">Our team will verify the change against reliable sources before updating the profile.</p><button onClick={() => setOpen(false)} className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white">Done</button></div>
            ) : (
              <form onSubmit={submit} className="space-y-4">
                <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <label className="block"><span className="mb-1 block text-sm font-semibold">What needs changing?</span><select name="correction_type" required className="w-full rounded-xl border border-gray-200 p-3 text-sm"><option value="incorrect_information">Incorrect information</option><option value="contact_update">Contact details</option><option value="program_update">Programs or grades</option><option value="closed_or_moved">Closed or moved</option><option value="claim_profile">I represent this institution</option><option value="other">Something else</option></select></label>
                <label className="block"><span className="mb-1 block text-sm font-semibold">Correct information *</span><textarea name="details" minLength={10} maxLength={4000} rows={5} required placeholder="Tell us what is wrong and what it should say…" className="w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
                <label className="block"><span className="mb-1 block text-sm font-semibold">Supporting source</span><input name="source_url" type="url" placeholder="https://official-source.gov.np/…" className="w-full rounded-xl border border-gray-200 p-3 text-sm" /></label>
                <div className="grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-sm font-semibold">Your name</span><input name="reporter_name" maxLength={120} className="w-full rounded-xl border border-gray-200 p-3 text-sm" /></label><label><span className="mb-1 block text-sm font-semibold">Your role</span><select name="reporter_role" className="w-full rounded-xl border border-gray-200 p-3 text-sm"><option value="student">Student</option><option value="parent">Parent</option><option value="staff">Institution staff</option><option value="alumni">Alumni</option><option value="other">Other</option></select></label></div>
                <label className="block"><span className="mb-1 block text-sm font-semibold">Email *</span><input name="reporter_email" type="email" required maxLength={254} className="w-full rounded-xl border border-gray-200 p-3 text-sm" /><span className="mt-1 block text-xs text-gray-400">Used only if we need to verify your report.</span></label>
                {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
                <button disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-60">{saving && <Loader2 className="h-4 w-4 animate-spin" />}Submit for verification</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

