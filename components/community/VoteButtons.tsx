'use client'

import { useState } from 'react'
import { ArrowBigDown, ArrowBigUp } from 'lucide-react'

export default function VoteButtons({ targetType, targetId, initialScore = 0 }: { targetType: 'post' | 'comment'; targetId: string; initialScore?: number }) {
  const [score, setScore] = useState(initialScore)
  const [choice, setChoice] = useState<-1 | 0 | 1>(0)
  const [busy, setBusy] = useState(false)
  async function vote(value: -1 | 1) {
    if (busy) return
    setBusy(true)
    const response = await fetch('/api/community/vote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target_type: targetType, target_id: targetId, value }) })
    const result = await response.json()
    if (response.ok) { setScore(result.score); setChoice(current => current === value ? 0 : value) }
    setBusy(false)
  }
  return <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 p-0.5" aria-label={`Vote score ${score}`}><button disabled={busy} onClick={()=>vote(1)} aria-label="Helpful" className={`rounded-full p-1.5 ${choice===1?'bg-blue-100 text-blue-700':'text-gray-400 hover:text-blue-700'}`}><ArrowBigUp className="h-4 w-4"/></button><span className="min-w-7 text-center text-xs font-bold text-gray-700">{score}</span><button disabled={busy} onClick={()=>vote(-1)} aria-label="Not helpful" className={`rounded-full p-1.5 ${choice===-1?'bg-red-100 text-red-700':'text-gray-400 hover:text-red-700'}`}><ArrowBigDown className="h-4 w-4"/></button></div>
}
