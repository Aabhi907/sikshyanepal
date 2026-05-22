'use client'

import { useState, useEffect } from 'react'
import { Send, Users, CheckCircle } from 'lucide-react'
import ApplyNowModal from './ApplyNowModal'

interface Program {
  name: string
}

interface Props {
  collegeName: string
  collegeId:   string
  isFeatured:  boolean
  programs:    Program[]
  leadsCount:  number
}

const LS_KEY    = (id: string) => `applied_${id}`
const EXPIRY_MS = 30 * 24 * 60 * 60 * 1000  // 30 days

export default function ApplyNowButton({
  collegeName, collegeId, isFeatured, programs, leadsCount,
}: Props) {
  const [open,    setOpen]    = useState(false)
  const [applied, setApplied] = useState(false)

  // Restore applied state from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY(collegeId))
      if (raw) {
        const ts = parseInt(raw, 10)
        if (Date.now() - ts < EXPIRY_MS) {
          setApplied(true)
        } else {
          localStorage.removeItem(LS_KEY(collegeId))
        }
      }
    } catch {
      // localStorage unavailable
    }
  }, [collegeId])

  // Called by the modal after a successful submission
  const handleSuccess = () => {
    try {
      localStorage.setItem(LS_KEY(collegeId), Date.now().toString())
    } catch {
      // ignore
    }
    setApplied(true)
    setOpen(false)
  }

  // ── Already applied state ────────────────────────────────────────────────
  if (applied) {
    return (
      <div className="mt-4">
        <div className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold rounded-xl">
          <CheckCircle className="w-4 h-4" />
          Application Submitted
        </div>
        <p className="mt-1.5 text-center text-xs text-gray-400">
          The college will contact you within 48 hours.
        </p>
      </div>
    )
  }

  // ── Apply Now button ─────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#1847c4] text-white text-sm font-semibold rounded-xl hover:bg-[#1340b0] transition-colors shadow-sm"
      >
        <Send className="w-4 h-4" />
        Apply Now — It&apos;s Free
      </button>

      {leadsCount > 0 && (
        <p className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>
            <strong className="text-gray-700">{leadsCount}</strong>{' '}
            student{leadsCount !== 1 ? 's' : ''} applied this month
          </span>
        </p>
      )}

      {open && (
        <ApplyNowModal
          collegeName={collegeName}
          collegeId={collegeId}
          isFeatured={isFeatured}
          programs={programs}
          onClose={() => setOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  )
}
