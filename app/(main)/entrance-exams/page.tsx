import type { Metadata } from 'next'
import { CalendarClock, CheckCircle2, ExternalLink, FileText } from 'lucide-react'
import { createServerSupabaseClient } from '@/lib/supabase'
import type { EntranceExam } from '@/types'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Entrance Exams in Nepal – Dates, Deadlines and Eligibility',
  description: 'Track verified entrance exam application deadlines, exam dates, fees, eligibility and official notices for study in Nepal.',
}

function dateLabel(value: string | null) {
  return value ? new Date(value).toLocaleDateString('en-NP', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not announced'
}

export default async function EntranceExamsPage({ searchParams }: { searchParams: { q?: string; level?: string } }) {
  const db = createServerSupabaseClient()
  let query = db.from('entrance_exams').select('*, university:universities(name,short_name)').eq('status', 'published').order('application_deadline', { ascending: true, nullsFirst: false }).limit(100)
  if (searchParams.q) query = query.or(`title.ilike.%${searchParams.q}%,program.ilike.%${searchParams.q}%,exam_body.ilike.%${searchParams.q}%`)
  if (searchParams.level) query = query.eq('education_level', searchParams.level)
  const { data } = await query
  const exams = (data || []) as EntranceExam[]
  const now = Date.now()
  const open = exams.filter((exam) => !exam.application_deadline || new Date(exam.application_deadline).getTime() >= now)
  const closed = exams.filter((exam) => exam.application_deadline && new Date(exam.application_deadline).getTime() < now)

  return <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
    <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[.14em] text-[#9a302c]">Plan before the deadline</p><h1 className="mt-2 font-display text-4xl font-bold text-ink">Entrance exams in Nepal</h1><p className="mt-3 text-base leading-7 text-slate-600">One place for application deadlines, exam dates, eligibility and official notices. Always confirm details at the linked source before paying or applying.</p></div>
    <form className="mt-7 grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_190px_auto]">
      <input name="q" defaultValue={searchParams.q} placeholder="Search exam, program or exam body" className="rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary" />
      <select name="level" defaultValue={searchParams.level || ''} className="rounded-lg border border-gray-200 bg-white px-3 py-3 text-sm"><option value="">All levels</option><option>+2</option><option>Bachelor</option><option>Master</option><option>Diploma</option></select>
      <button className="rounded-lg bg-primary px-5 py-3 text-sm font-bold text-white">Find exams</button>
    </form>
    <div className="mt-8 flex items-center justify-between"><h2 className="text-xl font-bold text-ink">Open and upcoming</h2><span className="text-sm text-slate-500">{open.length} listed</span></div>
    {open.length ? <div className="mt-4 grid gap-4 lg:grid-cols-2">{open.map((exam) => <ExamCard key={exam.id} exam={exam} />)}</div> : <div className="mt-4 rounded-xl border border-gray-200 bg-white px-6 py-14 text-center"><CalendarClock className="mx-auto h-10 w-10 text-gray-300"/><h3 className="mt-3 font-bold text-ink">No open exams found</h3><p className="mt-1 text-sm text-gray-500">Try another search or check back when official notices are published.</p></div>}
    {closed.length > 0 && <details className="mt-8 rounded-xl border border-gray-200 bg-white p-5"><summary className="cursor-pointer font-bold text-ink">Recently closed ({closed.length})</summary><div className="mt-4 grid gap-4 lg:grid-cols-2">{closed.map((exam) => <ExamCard key={exam.id} exam={exam} closed />)}</div></details>}
  </div>
}

function ExamCard({ exam, closed = false }: { exam: EntranceExam; closed?: boolean }) {
  return <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3"><div><div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wide text-primary"><span>{exam.education_level || 'Entrance'}</span>{exam.exam_body && <span className="text-slate-400">· {exam.exam_body}</span>}</div><h3 className="mt-2 text-lg font-bold text-ink">{exam.title}</h3>{exam.program && <p className="mt-1 text-sm text-slate-500">{exam.program}</p>}</div><span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${closed ? 'bg-gray-100 text-gray-500' : 'bg-emerald-50 text-emerald-700'}`}>{closed ? 'Closed' : 'Upcoming'}</span></div>
    <div className="mt-5 grid grid-cols-2 gap-3 rounded-lg bg-[#f8f7f3] p-4 text-sm"><div><p className="text-xs text-slate-500">Apply by</p><p className="mt-1 font-bold text-ink">{dateLabel(exam.application_deadline)}</p></div><div><p className="text-xs text-slate-500">Exam date</p><p className="mt-1 font-bold text-ink">{dateLabel(exam.exam_date)}</p></div>{exam.fee != null && <div><p className="text-xs text-slate-500">Application fee</p><p className="mt-1 font-bold text-ink">NPR {exam.fee.toLocaleString()}</p></div>}{exam.last_verified_at && <div><p className="text-xs text-slate-500">Last checked</p><p className="mt-1 flex items-center gap-1 font-medium text-slate-700"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600"/>{dateLabel(exam.last_verified_at)}</p></div>}</div>
    {exam.eligibility && <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600"><strong className="text-ink">Eligibility:</strong> {exam.eligibility}</p>}
    <div className="mt-5 flex flex-wrap gap-3 border-t border-gray-100 pt-4">{exam.exam_url && <a href={exam.exam_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">Official notice <ExternalLink className="h-4 w-4"/></a>}{exam.syllabus_url && <a href={exam.syllabus_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600"><FileText className="h-4 w-4"/>Syllabus</a>} {!exam.exam_url && exam.source_url && <a href={exam.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-primary">Verify source <ExternalLink className="h-4 w-4"/></a>}</div>
  </article>
}
