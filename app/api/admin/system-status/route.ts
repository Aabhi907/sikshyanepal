import { isStaff } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'

const checks = [
  ['schools', 'School directory'], ['admissions', 'Admissions engine'], ['content_sources', 'Source registry'],
  ['content_ingestion_items', 'Editorial ingestion queue'], ['profiles', 'Role-based accounts'], ['programs', 'Program discovery'],
  ['institution_claims', 'Institution claims'], ['review_verifications', 'Verified reviews'], ['admission_deadline_history', 'Deadline history'], ['review_responses', 'Institution review responses'],
] as const

export async function GET() {
  if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 })
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  if (!configured) return NextResponse.json({ configured: false, checks: checks.map(([table, label]) => ({ table, label, ready: false, detail: 'Supabase environment variables are missing.' })) })
  const db = createAdminSupabaseClient()
  const results = await Promise.all(checks.map(async ([table, label]) => {
    const { error } = await db.from(table).select('id', { head: true, count: 'exact' }).limit(1)
    return { table, label, ready: !error, detail: error ? (error.code === '42P01' ? 'Table is missing: apply its migration.' : error.message) : 'Ready' }
  }))
  return NextResponse.json({ configured: true, checks: results })
}
