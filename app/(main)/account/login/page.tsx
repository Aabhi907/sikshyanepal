'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useState } from 'react'
import GoogleSignInButton from '@/components/auth/GoogleSignInButton'

export default function AccountLogin() {
  const router = useRouter(); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('')
  const [oauthError, setOauthError] = useState('')
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('error')) setOauthError('Google sign-in could not be completed. Please try again.')
  }, [])
  async function submit(event: FormEvent) { event.preventDefault(); const response = await fetch('/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({email,password}) }); const data = await response.json(); if (!response.ok) return setError(data.error); router.push('/my-path'); router.refresh() }
  const field='mt-1 w-full rounded-lg border border-[#d9d6cf] bg-white px-3 py-3 text-sm outline-none focus:border-primary'
  return <main className="min-h-screen bg-[#f8f7f3] px-4 py-16"><section className="mx-auto max-w-md rounded-xl border border-[#e6e4df] bg-white p-6 shadow-sm sm:p-8"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">SikshyaNepal account</p><h1 className="mt-3 font-display text-3xl font-bold text-ink">Welcome back</h1><p className="mt-2 text-sm leading-6 text-slate-600">Access your saved institutions, admission plans and personal study path.</p><div className="mt-7"><GoogleSignInButton />{oauthError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{oauthError}</p>}</div><div className="my-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-400"><span className="h-px flex-1 bg-[#e6e4df]"/><span>or use email</span><span className="h-px flex-1 bg-[#e6e4df]"/></div><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold text-ink">Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className={field} autoComplete="email"/></label><label className="block text-sm font-semibold text-ink">Password<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} className={field} autoComplete="current-password"/></label>{error&&<p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}<button className="w-full rounded-lg bg-primary py-3 text-sm font-bold text-white hover:bg-primary-600">Sign in</button></form><p className="mt-5 text-sm text-slate-600">New here? <Link href="/account/register" className="font-bold text-primary hover:underline">Create an account</Link></p><p className="mt-4 border-t border-[#e6e4df] pt-4 text-xs leading-5 text-slate-500">Institution representatives can sign in here too, then claim or manage an approved institution profile.</p></section></main>
}
