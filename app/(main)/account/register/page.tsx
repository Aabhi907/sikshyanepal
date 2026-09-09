'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function Register() {
  const router = useRouter()
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const field = 'mt-1 w-full rounded-lg border border-[#d9d6cf] bg-white px-3 py-3 text-sm outline-none focus:border-primary'

  async function submit(event: FormEvent) {
    event.preventDefault()
    const response = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await response.json()
    if (!response.ok) return setError(data.error)
    if (data.confirmation_required) return setError('Check your email to confirm your account, then sign in.')
    router.push('/')
  }

  return <main className="min-h-screen bg-[#f8f7f3] px-4 py-16"><section className="mx-auto max-w-md rounded-xl border border-[#e6e4df] bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">SikshyaNepal account</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">Create your account</h1><p className="mt-2 text-sm leading-6 text-slate-600">Save your shortlist, build a private study plan and track applications in one place.</p><div className="mt-7"><GoogleSignInButton /></div><div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-[#e6e4df]"/><span>or use email</span><span className="h-px flex-1 bg-[#e6e4df]"/></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-ink">Your name<input required value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} className={field} autoComplete="name" /></label><label className="block text-sm font-semibold text-ink">Email<input type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className={field} autoComplete="email" /></label><label className="block text-sm font-semibold text-ink">Password<input type="password" minLength={10} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className={field} autoComplete="new-password" /><span className="mt-1 block text-xs font-normal text-slate-500">Use at least 10 characters.</span></label>{error && <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}<button className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary-600">Create account</button></form><p className="mt-5 text-sm text-slate-600">Already have an account? <Link href="/account/login" className="font-bold text-primary hover:underline">Sign in</Link></p><p className="mt-4 border-t border-[#e6e4df] pt-4 text-xs leading-5 text-slate-500">Creating an account does not automatically grant control of an institution profile. Institution claims are reviewed separately.</p></section></main>
}
