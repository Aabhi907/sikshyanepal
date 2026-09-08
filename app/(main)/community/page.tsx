import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, ShieldCheck } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import { COMMUNITY_TOPICS, CommunityPost, topicLabel } from '@/lib/community'
import NewPostForm from '@/components/community/NewPostForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = {
  title: 'Anonymous Student Community | SikshyaNepal',
  description: 'A moderated anonymous space for students in Nepal to discuss colleges, admissions, programs, exams and study life safely.',
  alternates: { canonical: '/community' },
  robots: { index: false, follow: true },
}

async function getPosts(topic?: string) {
  const db = createServerSupabaseClient()
  let query = db.from('community_posts').select('id,title,body,topic,status,created_at,published_at,community_comments(count)').eq('status', 'published').order('published_at', { ascending: false }).limit(50)
  if (topic && COMMUNITY_TOPICS.some(item => item.value === topic)) query = query.eq('topic', topic)
  const { data, error } = await query
  return { posts: (data || []) as CommunityPost[], failed: Boolean(error) }
}

function timeLabel(value: string | null) {
  if (!value) return 'Recently'
  return new Intl.DateTimeFormat('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value))
}

export default async function CommunityPage({ searchParams }: { searchParams: { topic?: string } }) {
  const { posts, failed } = await getPosts(searchParams.topic)
  return <main className="min-h-screen bg-[#f6f7fb]">
    <section className="border-b border-gray-200 bg-white"><div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-xs font-bold uppercase tracking-widest text-primary">Student community</p><h1 className="mt-3 font-display text-3xl font-extrabold text-ink sm:text-4xl">Talk openly. Stay anonymous.</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Discuss college life, admissions, programs and study challenges without publishing your name or account. Every post and reply is reviewed before it appears.</p><div className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900"><ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0"/><span>Do not share phone numbers, addresses, private messages, accusations, or identifying details. For immediate danger or a mental-health crisis, contact a trusted adult or emergency service—not this board.</span></div></div></section>
    <div className="mx-auto grid max-w-6xl gap-7 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div>
        <nav aria-label="Community topics" className="mb-5 flex gap-2 overflow-x-auto pb-2"><Link href="/community" className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${!searchParams.topic?'border-primary bg-primary text-white':'border-gray-200 bg-white text-gray-600'}`}>All topics</Link>{COMMUNITY_TOPICS.map(item=><Link key={item.value} href={`/community?topic=${item.value}`} className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-bold ${searchParams.topic===item.value?'border-primary bg-primary text-white':'border-gray-200 bg-white text-gray-600'}`}>{item.label}</Link>)}</nav>
        {failed ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-900"><h2 className="font-bold">Community could not load</h2><p className="mt-2 text-sm">The community database may still need its migration. Please try again after setup.</p></div> : posts.length ? <div className="space-y-3">{posts.map(post=><article key={post.id} className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-blue-200 hover:shadow-sm"><div className="flex flex-wrap items-center gap-2 text-xs"><span className="rounded-full bg-blue-50 px-2.5 py-1 font-bold text-blue-700">{topicLabel(post.topic)}</span><span className="text-gray-400">Anonymous student · {timeLabel(post.published_at || post.created_at)}</span></div><Link href={`/community/${post.id}`}><h2 className="mt-3 text-lg font-bold text-ink hover:text-primary">{post.title}</h2><p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-600">{post.body}</p></Link><p className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-gray-400"><MessageCircle className="h-4 w-4"/>{post.community_comments?.[0]?.count || 0} replies</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center"><MessageCircle className="mx-auto h-10 w-10 text-gray-300"/><h2 className="mt-4 font-bold text-ink">No published discussions yet</h2><p className="mt-2 text-sm text-gray-500">Start a useful discussion. It will appear after moderation.</p></div>}
      </div>
      <aside><NewPostForm/><div className="mt-4 rounded-2xl border border-gray-200 bg-white p-5"><h2 className="font-bold text-ink">Community rules</h2><ul className="mt-3 space-y-2 text-xs leading-5 text-gray-600"><li>• Be respectful and useful.</li><li>• Never identify or target a student.</li><li>• No contact details, ads or spam.</li><li>• Mark personal experiences as your experience.</li><li>• Verify admission, fee and health information through official sources.</li></ul></div></aside>
    </div>
  </main>
}
