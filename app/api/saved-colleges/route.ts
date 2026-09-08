import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type SavedRow = {
  college_id: string
  college: {
    id: string
    name: string
    slug: string
    location: string
    affiliation: string | null
    education_levels: string[] | null
    verification_status: string
    status: string | null
  } | null
}

export async function GET() {
  const auth = await getAuthContext()
  if (!auth) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })

  const { data, error } = await createAdminSupabaseClient()
    .from('saved_colleges')
    .select('college_id,college:colleges(id,name,slug,location,affiliation,education_levels,verification_status,status)')
    .eq('user_id', auth.user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: 'Your saved colleges could not be loaded.' }, { status: 500 })

  const rows = (data || []) as unknown as SavedRow[]
  const visible = rows
    .filter(item => item.college && (item.college.status === 'active' || item.college.status == null))
    .map(item => ({
      college_id: item.college_id,
      college: item.college ? {
        id: item.college.id,
        name: item.college.name,
        slug: item.college.slug,
        location: item.college.location,
        affiliation: item.college.affiliation,
        education_levels: item.college.education_levels,
        verification_status: item.college.verification_status,
      } : null,
    }))

  return NextResponse.json(visible, { headers: { 'Cache-Control': 'private, no-store' } })
}
