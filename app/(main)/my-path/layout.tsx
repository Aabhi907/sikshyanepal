import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My Path',
  robots: { index: false, follow: false },
}

export default function MyPathLayout({ children }: { children: React.ReactNode }) {
  return children
}
