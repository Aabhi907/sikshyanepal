import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
  alternates: { canonical: '/' },
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
