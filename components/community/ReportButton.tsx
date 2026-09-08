'use client'

import { useState } from 'react'

export default function ReportButton({ targetType, targetId }: { targetType: 'post' | 'comment'; targetId: string }) {
  const [done, setDone] = useState(false)
  async function report() {
    if (done) return
    const response = await fetch('/api/community/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_type: targetType, target_id: targetId, reason: 'other' }) })
    if (response.ok) setDone(true)
  }
  return <button onClick={report} className="text-xs font-semibold text-gray-400 hover:text-red-600">{done ? 'Reported for review' : 'Report'}</button>
}
