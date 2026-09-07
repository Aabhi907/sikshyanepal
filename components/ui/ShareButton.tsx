'use client'

import { Check, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function ShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false)
  async function share() { const url = window.location.href; try { if (navigator.share) await navigator.share({ title, url }); else { await navigator.clipboard.writeText(url); setCopied(true); window.setTimeout(() => setCopied(false), 1800) } } catch {} }
  return <button type="button" onClick={share} className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm font-bold text-gray-700 shadow-sm hover:border-blue-200 hover:text-primary"><span>{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}</span>{copied ? 'Link copied' : 'Share'}</button>
}
