import { MetadataRoute } from 'next'
import { createServerSupabaseClient } from '@/lib/supabase'

const BASE_URL = 'https://sikshyanepal.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerSupabaseClient()

  const [admissions, schools, colleges, results, notices, news, programs] = await Promise.all([
    supabase
      .from('admissions')
      .select('slug, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false }),
    supabase
      .from('schools')
      .select('slug, updated_at, district, local_level')
      .eq('status', 'active')
      .order('updated_at', { ascending: false }),
    supabase
      .from('colleges')
      .select('slug, created_at, district')
      .order('created_at', { ascending: false }),
    supabase
      .from('results')
      .select('slug, published_date')
      .order('published_date', { ascending: false })
      .limit(500),
    supabase
      .from('notices')
      .select('slug, published_date')
      .order('published_date', { ascending: false })
      .limit(500),
    supabase
      .from('news')
      .select('slug, published_date')
      .order('published_date', { ascending: false })
      .limit(200),
    supabase
      .from('programs')
      .select('slug, created_at'),
  ])

  const now = new Date()

  // ── Static routes ──────────────────────────────────────────────────────────
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             BASE_URL,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        1.0,
    },
    {
      url:             `${BASE_URL}/admissions`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/schools/compare`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/tools/school-finder`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/schools`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/colleges`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/results`,
      lastModified:    now,
      changeFrequency: 'hourly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/notices`,
      lastModified:    now,
      changeFrequency: 'hourly',
      priority:        0.9,
    },
    {
      url:             `${BASE_URL}/news`,
      lastModified:    now,
      changeFrequency: 'daily',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/programs`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.8,
    },
    {
      url:             `${BASE_URL}/compare`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
    {
      url:             `${BASE_URL}/scholarships`,
      lastModified:    now,
      changeFrequency: 'weekly',
      priority:        0.7,
    },
  ]

  // ── Dynamic routes ─────────────────────────────────────────────────────────
  const admissionRoutes: MetadataRoute.Sitemap = (admissions.data ?? []).map((a) => ({
    url:             `${BASE_URL}/admissions/${a.slug}`,
    lastModified:    new Date(a.updated_at),
    changeFrequency: 'daily' as const,
    priority:        0.8,
  }))

  const schoolRoutes: MetadataRoute.Sitemap = (schools.data ?? []).map((s) => ({
    url:             `${BASE_URL}/schools/${s.slug}`,
    lastModified:    new Date(s.updated_at),
    changeFrequency: 'monthly' as const,
    priority:        0.8,
  }))

  const collegeRoutes: MetadataRoute.Sitemap = (colleges.data ?? []).map((c) => ({
    url:             `${BASE_URL}/colleges/${c.slug}`,
    lastModified:    new Date(c.created_at),
    changeFrequency: 'weekly' as const,
    priority:        0.8,
  }))

  const resultRoutes: MetadataRoute.Sitemap = (results.data ?? []).map((r) => ({
    url:             `${BASE_URL}/results/${r.slug}`,
    lastModified:    new Date(r.published_date),
    changeFrequency: 'never' as const,
    priority:        0.7,
  }))

  const noticeRoutes: MetadataRoute.Sitemap = (notices.data ?? []).map((n) => ({
    url:             `${BASE_URL}/notices/${n.slug}`,
    lastModified:    new Date(n.published_date),
    changeFrequency: 'never' as const,
    priority:        0.7,
  }))

  const newsRoutes: MetadataRoute.Sitemap = (news.data ?? []).map((n) => ({
    url:             `${BASE_URL}/news/${n.slug}`,
    lastModified:    new Date(n.published_date),
    changeFrequency: 'never' as const,
    priority:        0.7,
  }))

  const programRoutes: MetadataRoute.Sitemap = (programs.data ?? []).map((p) => ({
    url:             `${BASE_URL}/programs/${p.slug}`,
    lastModified:    new Date(p.created_at),
    changeFrequency: 'monthly' as const,
    priority:        0.6,
  }))
  const programCollegeRoutes: MetadataRoute.Sitemap = (programs.data ?? []).map((p) => ({ url: `${BASE_URL}/colleges/program/${p.slug}`, lastModified: new Date(p.created_at), changeFrequency: 'weekly' as const, priority: 0.75 }))
  const locationRoutes: MetadataRoute.Sitemap = Array.from(new Set((colleges.data ?? []).map(c => c.district).filter(Boolean))).map(district => ({ url: `${BASE_URL}/colleges/in/${String(district).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 }))
  const schoolDistrictRoutes: MetadataRoute.Sitemap = Array.from(new Set((schools.data ?? []).map(s => s.district).filter(Boolean))).map(district => ({ url: `${BASE_URL}/schools/in/${String(district).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.7 }))
  const municipalityRoutes: MetadataRoute.Sitemap = Array.from(new Set((schools.data ?? []).map(s => s.local_level).filter(Boolean))).map(municipality => ({ url: `${BASE_URL}/schools/municipality/${String(municipality).toLowerCase().replace(/[^a-z0-9]+/g,'-')}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.65 }))

  return [
    ...staticRoutes,
    ...admissionRoutes,
    ...schoolRoutes,
    ...collegeRoutes,
    ...resultRoutes,
    ...noticeRoutes,
    ...newsRoutes,
    ...programRoutes,
    ...programCollegeRoutes,
    ...locationRoutes,
    ...schoolDistrictRoutes,
    ...municipalityRoutes,
  ]
}
