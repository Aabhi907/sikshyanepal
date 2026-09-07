'use client'

import Link from 'next/link'
import { Bookmark, MapPin, School } from 'lucide-react'
import { useEffect, useState } from 'react'

type SavedSchool = {
  school_id: string
  school: { id: string; name: string; slug: string; district: string | null; local_level: string | null; verification_status: string } | null
}

export default function SavedSchoolsPage() {
  const [items, setItems] = useState<SavedSchool[]>([])
  const [needsLogin, setNeedsLogin] = useState(false)

  useEffect(() => {
    fetch('/api/saved-schools').then(async (response) => {
      if (response.status === 401) {
        setNeedsLogin(true)
        return []
      }
      return response.json()
    }).then((data) => Array.isArray(data) && setItems(data))
  }, [])

  return <main className="mx-auto max-w-4xl px-4 py-12">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="flex items-center gap-2 text-3xl font-bold"><School className="h-7 w-7 text-blue-600" />Saved schools</h1><p className="mt-2 text-gray-500">Keep school options together while comparing location, grades and admissions.</p></div>
      <Link href="/account/saved" className="text-sm font-bold text-primary hover:underline">Saved colleges →</Link>
    </div>
    {needsLogin ? <div className="mt-8 rounded-2xl border bg-white p-8 text-center"><p>Sign in to see and save your school shortlist.</p><Link href="/account/login" className="mt-4 inline-block rounded-xl bg-primary px-5 py-3 font-bold text-white">Sign in</Link></div> : <div className="mt-8 space-y-3">
      {items.map((item) => item.school && <Link key={item.school_id} href={`/schools/${item.school.slug}`} className="flex items-center justify-between rounded-xl border bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"><span><strong>{item.school.name}</strong><span className="mt-1 flex items-center gap-1 text-sm text-gray-500"><MapPin className="h-3 w-3" />{[item.school.local_level, item.school.district].filter(Boolean).join(', ') || 'Location pending'}</span></span><span className="text-blue-700">View →</span></Link>)}
      {!items.length && <div className="rounded-2xl border bg-white p-10 text-center"><Bookmark className="mx-auto h-7 w-7 text-gray-300" /><p className="mt-3 text-gray-500">You have not saved any schools yet.</p><Link href="/schools" className="mt-4 inline-block font-bold text-primary hover:underline">Explore schools →</Link></div>}
    </div>}
  </main>
}
