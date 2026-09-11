/** Accept only local, public application paths for post-authentication redirects. */
export function safeNextPath(value: string | null | undefined, fallback = '/') {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\') || /[\u0000-\u001f]/.test(value)) return fallback
  try {
    const parsed = new URL(value, 'https://sikshyanepal.local')
    if (parsed.origin !== 'https://sikshyanepal.local' || parsed.pathname.startsWith('/admin')) return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
