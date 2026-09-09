'use client'

import { useCallback, useEffect, useState } from 'react'

export type CommunityIdentity = { loading: boolean; authenticated: boolean; alias: string | null; status: string }

export function useCommunityIdentity() {
  const [identity, setIdentity] = useState<CommunityIdentity>({ loading: true, authenticated: false, alias: null, status: 'active' })
  const refresh = useCallback(async () => {
    const response = await fetch('/api/community/me', { cache: 'no-store' })
    const result = await response.json()
    setIdentity({ loading: false, authenticated: Boolean(result.authenticated), alias: result.alias || null, status: result.status || 'active' })
  }, [])
  useEffect(() => { void refresh() }, [refresh])
  return { identity, refresh }
}
