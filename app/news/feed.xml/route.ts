import { createServerSupabaseClient } from '@/lib/supabase'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

const xml = (value: string) => value.replace(/[<>&'\"]/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[char] || char))

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('news').select('title,slug,content,published_date,source_url,content_category').eq('status', 'published').order('published_date', { ascending: false }).limit(50)
  const items = (data || []).map(item => `<item><title>${xml(item.title)}</title><link>${SITE_URL}/news/${xml(item.slug)}</link><guid isPermaLink="true">${SITE_URL}/news/${xml(item.slug)}</guid><pubDate>${new Date(item.published_date).toUTCString()}</pubDate><category>${xml(item.content_category || 'College news')}</category><description>${xml(String(item.content || '').slice(0, 500))}</description>${item.source_url ? `<source url="${xml(item.source_url)}">Original source</source>` : ''}</item>`).join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>SikshyaNepal College News</title><link>${SITE_URL}/news</link><description>Verified Nepal college admissions, results, scholarships, achievements and campus events.</description><language>en-NP</language><lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}</channel></rss>`
  return new Response(body, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=900, stale-while-revalidate=3600' } })
}
