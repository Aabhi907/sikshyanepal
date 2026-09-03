import Link from 'next/link'
export default function NotFound() { return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="font-display text-2xl font-bold text-ink">Admission not found</h1><p className="mt-2 text-sm text-gray-500">It may have been archived or is awaiting verification.</p><Link href="/admissions" className="mt-6 inline-block rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white">Browse admissions</Link></div> }

