'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BadgeCheck, ExternalLink, Search, School } from 'lucide-react'
import type { School as SchoolType, VerificationStatus } from '@/types'

export default function AdminSchoolsPage() {
  const [schools, setSchools] = useState<SchoolType[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  useEffect(() => { fetch('/api/admin/schools', { cache: 'no-store' }).then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d.error); setSchools(d); }).catch((e) => setError(e.message)).finally(() => setLoading(false)) }, [])
  const visible = useMemo(() => schools.filter((s) => `${s.name} ${s.district} ${s.iemis_code}`.toLowerCase().includes(query.toLowerCase())), [schools, query])

  async function setVerification(school: SchoolType, verification_status: VerificationStatus) {
    const response = await fetch(`/api/admin/schools/${school.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ verification_status, last_verified_at: verification_status === 'unverified' ? null : new Date().toISOString() }) })
    if (!response.ok) return setError('Could not update verification status.')
    const updated = await response.json(); setSchools((all) => all.map((item) => item.id === updated.id ? updated : item))
  }

  return <div className="p-8 text-gray-100"><div className="mb-6 flex items-start justify-between"><div><h1 className="flex items-center gap-2 text-2xl font-bold text-white"><School className="h-6 w-6 text-blue-400" />Schools</h1><p className="mt-1 text-sm text-gray-400">{schools.length.toLocaleString()} profiles · import official datasets with scrapers/import_schools.py</p></div><Link href="/schools" target="_blank" className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300"><ExternalLink className="h-4 w-4" />View directory</Link></div>
    <div className="relative mb-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name, district or IEMIS code…" className="w-full rounded-lg border border-gray-700 bg-gray-800 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-blue-500" /></div>
    {error && <p className="mb-4 rounded-lg bg-red-950/50 p-3 text-sm text-red-300">{error}</p>}
    {loading ? <p className="py-16 text-center text-gray-500">Loading schools…</p> : <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800"><div className="max-h-[70vh] overflow-auto"><table className="w-full text-sm"><thead className="sticky top-0 bg-gray-800"><tr className="border-b border-gray-700 text-left text-gray-400"><th className="px-5 py-3 font-medium">School</th><th className="px-5 py-3 font-medium">Location</th><th className="px-5 py-3 font-medium">Source</th><th className="px-5 py-3 font-medium">Verification</th></tr></thead><tbody>{visible.map((school) => <tr key={school.id} className="border-b border-gray-700/50"><td className="px-5 py-3"><Link href={`/schools/${school.slug}`} target="_blank" className="font-medium text-white hover:text-blue-400">{school.name}</Link><p className="mt-0.5 font-mono text-xs text-gray-500">{school.iemis_code || 'No IEMIS code'}</p></td><td className="px-5 py-3 text-gray-400">{school.district}, {school.province}</td><td className="max-w-xs px-5 py-3 text-gray-400"><span className="line-clamp-1">{school.source_name || '—'}</span></td><td className="px-5 py-3"><label className="flex items-center gap-2"><BadgeCheck className={`h-4 w-4 ${school.verification_status === 'unverified' ? 'text-gray-600' : 'text-emerald-400'}`} /><select value={school.verification_status} onChange={(e) => setVerification(school, e.target.value as VerificationStatus)} className="rounded border border-gray-600 bg-gray-700 px-2 py-1.5 text-xs"><option value="unverified">Unverified</option><option value="source_verified">Source verified</option><option value="institution_verified">Institution verified</option></select></label></td></tr>)}</tbody></table>{visible.length === 0 && <p className="py-12 text-center text-gray-500">No schools found.</p>}</div></div>}
  </div>
}

