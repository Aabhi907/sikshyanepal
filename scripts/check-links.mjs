const base = new URL(process.env.CHECK_BASE_URL || 'http://localhost:3000')
const limit = Number(process.env.CHECK_PAGE_LIMIT || 250)
const queue = [base.href]
const visited = new Set()
const failures = []

function internalLinks(html, pageUrl) {
  const links = []
  for (const match of html.matchAll(/href=["']([^"'#]+)(?:#[^"']*)?["']/gi)) {
    try {
      const url = new URL(match[1], pageUrl)
      if (url.origin !== base.origin || !['http:', 'https:'].includes(url.protocol)) continue
      if (/\.(?:png|jpe?g|gif|svg|webp|avif|ico|pdf|xml)$/i.test(url.pathname)) continue
      url.hash = ''
      links.push(url.href)
    } catch {}
  }
  return links
}

while (queue.length && visited.size < limit) {
  const url = queue.shift()
  if (!url || visited.has(url)) continue
  visited.add(url)
  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'SikshyaNepalLaunchAudit/1.0' } })
    if (response.status >= 400) {
      failures.push({ url, status: response.status })
      continue
    }
    if ((response.headers.get('content-type') || '').includes('text/html')) {
      const html = await response.text()
      for (const link of internalLinks(html, url)) if (!visited.has(link)) queue.push(link)
    }
    if (visited.size % 25 === 0) console.log(`Checked ${visited.size} pages…`)
  } catch (error) {
    failures.push({ url, status: error instanceof Error ? error.message : 'request failed' })
  }
}

console.log(`Checked ${visited.size} internal pages from ${base.origin}.`)
if (failures.length) {
  console.error(`Found ${failures.length} broken page(s):`)
  for (const failure of failures) console.error(`${failure.status} ${failure.url}`)
  process.exitCode = 1
} else {
  console.log('No broken internal pages found.')
}
