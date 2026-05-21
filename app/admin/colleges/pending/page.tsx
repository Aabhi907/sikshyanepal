'use client'

import { useEffect, useState, useCallback } from 'react'
import { Building2, CheckCircle, Trash2, MapPin, Phone, Globe, User, Clock } from 'lucide-react'

interface PendingCollege {
  id: string
  name: string
  location: string
  affiliation: string | null
  phone: string | null
  email: string | null
  website: string | null
  description: string | null
  programs_offered: string | null
  submitted_by: string | null
  submitter_role: string | null
  submitter_contact: string | null
  source: string | null
  created_at: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const h    = Math.floor(diff / 3_600_000)
  const m    = Math.floor((diff % 3_600_000) / 60_000)
  const d    = Math.floor(h / 24)
  if (d > 0)   return `${d}d ago`
  if (h > 0)   return `${h}h ago`
  return `${m}m ago`
}

export default function PendingCollegesPage() {
  const [colleges,  setColleges]  = useState<PendingCollege[]>([])
  const [loading,   setLoading]   = useState(true)
  const [working,   setWorking]   = useState<string | null>(null)  // id being approved/rejected

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/colleges/pending')
      const data = await res.json()
      setColleges(Array.isArray(data) ? data : [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(id: string) {
    if (!confirm('Approve this college? It will become publicly visible.')) return
    setWorking(id)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ status: 'active' }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(`Failed to approve: ${err.error || res.status}`)
        return
      }
      setColleges((c) => c.filter((x) => x.id !== id))
    } catch (e) {
      alert('Network error — college not approved')
    } finally {
      setWorking(null)
    }
  }

  async function reject(id: string, name: string) {
    if (!confirm(`Reject and delete "${name}"? This cannot be undone.`)) return
    setWorking(id)
    try {
      const res = await fetch(`/api/admin/colleges/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json()
        alert(`Failed to reject: ${err.error || res.status}`)
        return
      }
      setColleges((c) => c.filter((x) => x.id !== id))
    } catch (e) {
      alert('Network error — college not rejected')
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="p-8 text-gray-100">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pending College Submissions</h1>
          <p className="text-gray-400 mt-1">Review and approve or reject submitted colleges</p>
        </div>
        {!loading && (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-sm font-bold rounded-full border border-yellow-500/30">
            {colleges.length} pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-xl border border-gray-700 p-6 animate-pulse">
              <div className="h-5 bg-gray-700 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-700 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : colleges.length === 0 ? (
        <div className="text-center py-20 bg-gray-800 rounded-2xl border border-gray-700">
          <div className="w-14 h-14 bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-7 h-7 text-gray-500" />
          </div>
          <h3 className="text-base font-semibold text-white mb-1">All clear!</h3>
          <p className="text-sm text-gray-400">No pending college submissions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {colleges.map((c) => (
            <div
              key={c.id}
              className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:border-gray-600 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">

                {/* Left: College details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-white text-lg leading-tight">{c.name}</h3>
                    {c.source === 'scraped' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-900/50 text-blue-400 rounded-full border border-blue-700/50 flex-shrink-0">
                        SCRAPED
                      </span>
                    )}
                    {c.source === 'public_submission' && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-900/50 text-purple-400 rounded-full border border-purple-700/50 flex-shrink-0">
                        PUBLIC
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400 mb-3">
                    {c.affiliation && (
                      <span className="font-mono text-blue-400 text-xs font-bold">{c.affiliation}</span>
                    )}
                    {c.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> {c.location}
                      </span>
                    )}
                    {c.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" /> {c.phone}
                      </span>
                    )}
                    {c.website && (
                      <a
                        href={c.website} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <Globe className="w-3.5 h-3.5" /> {c.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}
                  </div>

                  {c.programs_offered && (
                    <p className="text-xs text-gray-500 mb-2">
                      <span className="text-gray-400 font-semibold">Programs: </span>
                      {c.programs_offered}
                    </p>
                  )}

                  {c.description && (
                    <p className="text-sm text-gray-400 leading-relaxed line-clamp-2 mb-3">
                      {c.description}
                    </p>
                  )}

                  {/* Submitter info */}
                  {c.submitted_by && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 border-t border-gray-700/60 pt-3">
                      <User className="w-3.5 h-3.5" />
                      <span>
                        Submitted by <span className="text-gray-300 font-semibold">{c.submitted_by}</span>
                        {c.submitter_role && ` (${c.submitter_role})`}
                        {c.submitter_contact && ` — ${c.submitter_contact}`}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-xs text-gray-600 mt-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{timeAgo(c.created_at)}</span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => approve(c.id)}
                    disabled={working === c.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-500
                               text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => reject(c.id, c.name)}
                    disabled={working === c.id}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600/20 hover:bg-red-600/30
                               text-red-400 text-sm font-semibold rounded-lg border border-red-600/30 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
