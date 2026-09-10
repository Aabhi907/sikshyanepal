'use client'

import { useEffect, useRef, useState } from 'react'

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
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const read = () => { try { setAllowed(Boolean(JSON.parse(localStorage.getItem('sn_cookie_consent_v1') || '{}').marketing)) } catch { setAllowed(false) } }
    read(); window.addEventListener('sn-consent-changed', read)
    return () => window.removeEventListener('sn-consent-changed', read)
  }, [])

  useEffect(() => {
    // Don't run without a client ID (dev / pre-approval)
    if (!clientId || !allowed || pushed.current) return
    try {
      pushed.current = true
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense may throw if the script isn't loaded yet — ignore silently
    }
  }, [allowed, clientId])

  // Render nothing in dev or when AdSense is not configured
  if (!clientId || !allowed) return null

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
