'use client'

import { useState } from 'react'
import { Send, Users } from 'lucide-react'
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

export default function ApplyNowButton({
  collegeName, collegeId, isFeatured, programs, leadsCount,
}: Props) {
  const [open, setOpen] = useState(false)

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
            <strong className="text-gray-700">{leadsCount}</strong> student{leadsCount !== 1 ? 's' : ''} applied this month
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
        />
      )}
    </>
  )
}
