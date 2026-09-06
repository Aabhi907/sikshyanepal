import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

const stages = ['grade_10', 'plus_two', 'bachelor', 'graduate', 'parent'] as const
type Stage = (typeof stages)[number]

function setupError(message: string) {
  return NextResponse.json({ error: message, setupRequired: true }, { status: 503 })
}

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const db = createAdminSupabaseClient()
  const today = new Date().toISOString()
  const [profile, tasks, colleges, schools, admissions, scholarships] = await Promise.all([
    db.from('student_path_profiles').select('current_stage').eq('user_id', auth.user.id).maybeSingle(),
    db.from('student_path_tasks').select('id,task_key,title,is_completed').eq('user_id', auth.user.id).order('created_at'),
    db.from('saved_colleges').select('college:colleges(id,name,slug,location)').eq('user_id', auth.user.id).limit(5),
    db.from('saved_schools').select('school:schools(id,name,slug,district,province)').eq('user_id', auth.user.id).limit(5),
    db.from('admissions').select('id,title,slug,application_deadline,institution_name,education_level').eq('status', 'published').gte('application_deadline', today).order('application_deadline').limit(5),
    db.from('scholarships').select('id,title,deadline,amount').eq('is_active', true).gte('deadline', today).order('deadline').limit(4),
  ])

  if (profile.error?.code === '42P01' || tasks.error?.code === '42P01') {
    return setupError('The My Path database setup has not been applied yet.')
  }
  if (profile.error || tasks.error) return NextResponse.json({ error: 'Could not load your path.' }, { status: 500 })

  return NextResponse.json({
    name: auth.profile.full_name || auth.user.email?.split('@')[0] || 'Student',
    stage: profile.data?.current_stage || null,
    tasks: tasks.data || [],
    savedColleges: colleges.data || [],
    savedSchools: schools.data || [],
    admissions: admissions.data || [],
    scholarships: scholarships.data || [],
  })
}

export async function POST(request: Request) {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const body = await request.json()
  const db = createAdminSupabaseClient()

  if (body.stage) {
    if (!stages.includes(body.stage as Stage)) return NextResponse.json({ error: 'Choose a valid stage.' }, { status: 400 })
    const { error } = await db.from('student_path_profiles').upsert({ user_id: auth.user.id, current_stage: body.stage, updated_at: new Date().toISOString() })
    if (error?.code === '42P01') return setupError('The My Path database setup has not been applied yet.')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.task && typeof body.task.key === 'string' && typeof body.task.title === 'string') {
    const { error } = await db.from('student_path_tasks').upsert({
      user_id: auth.user.id,
      task_key: body.task.key.slice(0, 80),
      title: body.task.title.slice(0, 180),
      is_completed: Boolean(body.task.completed),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,task_key' })
    if (error?.code === '42P01') return setupError('The My Path database setup has not been applied yet.')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
