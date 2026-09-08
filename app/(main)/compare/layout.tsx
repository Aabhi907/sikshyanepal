import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Colleges in Nepal',
  description: 'Compare up to three Nepal colleges side by side using published programs, fees, scholarships, student reviews and verification details.',
  alternates: { canonical: '/compare' },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children
}
