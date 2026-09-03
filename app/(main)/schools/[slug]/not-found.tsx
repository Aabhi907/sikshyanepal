import Link from 'next/link'
import { School } from 'lucide-react'

export default function SchoolNotFound() {
  return <div className="mx-auto max-w-xl px-4 py-24 text-center"><School className="mx-auto h-12 w-12 text-gray-300" /><h1 className="mt-5 font-display text-2xl font-bold text-ink">School not found</h1><p className="mt-2 text-sm text-gray-500">This profile may be awaiting verification or is no longer available.</p><Link href="/schools" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Browse schools</Link></div>
}

