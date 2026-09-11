'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'
import { safeNextPath } from '@/lib/safe-next'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [confirmationSent, setConfirmationSent] = useState(false)
  const [nextPath, setNextPath] = useState('/')
  const field = 'mt-1 w-full rounded-lg border border-[#d9d6cf] bg-white px-3 py-3 text-sm outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-500'

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setInterval(() => setCooldown(value => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  useEffect(() => { setNextPath(safeNextPath(new URLSearchParams(window.location.search).get('next'))) }, [])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (busy || cooldown > 0) return
    setBusy(true); setError('')
    try {
      const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        if (data.retry_after) setCooldown(Number(data.retry_after))
        throw new Error(data.error || 'Account creation could not be completed. Please try again.')
      }
      if (data.confirmation_required) { setConfirmationSent(true); return }
      router.push(nextPath); router.refresh()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Check your connection and try again.')
    } finally {
      setBusy(false)
    }
  }

  if (confirmationSent) return <main id="main-content" className="flex min-h-screen items-center justify-center bg-[#f8f7f3] px-4 py-16"><section className="w-full max-w-md rounded-xl border border-[#e6e4df] bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600"/><h1 className="mt-5 font-display text-3xl font-bold text-ink">Check your email</h1><p className="mt-3 text-sm leading-6 text-slate-600">We sent a confirmation link to <strong>{form.email}</strong>. Open it to activate your account, then sign in.</p><Link href={`/account/login?next=${encodeURIComponent(nextPath)}`} className="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">Go to sign in</Link></section></main>

  return <main id="main-content" className="min-h-screen bg-[#f8f7f3] px-4 py-16"><section className="mx-auto max-w-md rounded-xl border border-[#e6e4df] bg-white p-6 shadow-sm sm:p-8">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">SikshyaNepal account</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">Create your account</h1><p className="mt-2 text-sm leading-6 text-slate-600">Save your shortlist, build a private study plan and track applications in one place.</p>
    <div className="mt-7"><GoogleSignInButton next={nextPath}/></div><div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-[#e6e4df]"/><span>or use email</span><span className="h-px flex-1 bg-[#e6e4df]"/></div>
    <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-ink">Your name<input required disabled={busy} value={form.full_name} onChange={event => setForm({ ...form, full_name: event.target.value })} className={field} autoComplete="name"/></label><label className="block text-sm font-semibold text-ink">Email<input type="email" required disabled={busy} value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className={field} autoComplete="email"/></label><label className="block text-sm font-semibold text-ink">Password<input type="password" minLength={10} required disabled={busy} value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} className={field} autoComplete="new-password"/><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 10 characters.</span></label>
      {error && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm leading-6 text-amber-900">{error}{cooldown > 0 && <span className="mt-1 block font-bold">Try again in {cooldown} seconds.</span>}</p>}
      <button disabled={busy || cooldown > 0} className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Creating account…' : cooldown > 0 ? `Wait ${cooldown}s` : 'Create account'}</button>
    </form><p className="mt-5 text-sm text-slate-600">Already have an account? <Link href={`/account/login?next=${encodeURIComponent(nextPath)}`} className="font-bold text-primary hover:underline">Sign in</Link></p><p className="mt-4 border-t border-[#e6e4df] pt-4 text-xs leading-5 text-slate-500">For faster setup, use Google. Institution access still requires separate approval.</p>
  </section></main>
}
