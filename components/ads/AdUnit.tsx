'use client'

import { useEffect, useRef } from 'react'

type AdFormat = 'horizontal' | 'rectangle' | 'auto'

interface AdUnitProps {
  slot: string
  format?: AdFormat
  className?: string
}

const FORMAT_STYLE: Record<AdFormat, React.CSSProperties> = {
  horizontal: { display: 'block', width: '100%', height: '90px' },
  rectangle:  { display: 'block', width: '300px', height: '250px' },
  auto:       { display: 'block' },
}

// Declare adsbygoogle on window for TypeScript
declare global {
  interface Window {
    adsbygoogle: unknown[]
  }
}

export default function AdUnit({ slot, format = 'auto', className = '' }: AdUnitProps) {
  const adRef  = useRef<HTMLModElement>(null)
  const pushed = useRef(false)
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    // Don't run without a client ID (dev / pre-approval)
    if (!clientId || pushed.current) return
    try {
      pushed.current = true
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense may throw if the script isn't loaded yet — ignore silently
    }
  }, [clientId])

  // Render nothing in dev or when AdSense is not configured
  if (!clientId) return null

  return (
    <div
      className={`ad-unit overflow-hidden flex items-center justify-center ${className}`}
      aria-label="Advertisement"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={format === 'auto' ? { display: 'block', width: '100%' } : FORMAT_STYLE[format]}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format === 'auto' ? 'auto' : undefined}
        data-full-width-responsive={format === 'auto' ? 'true' : undefined}
      />
    </div>
  )
}
