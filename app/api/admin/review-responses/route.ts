import { isStaff } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase'
export async function GET() { if (!(await isStaff(['editor', 'owner']))) return NextResponse.json({ error: 'Editor access required' }, { status: 403 }); const { data, error } = await createAdminSupabaseClient().from('review_responses').select('*,review:reviews(student_name,review_text),college:colleges(name)').order('created_at', { ascending: false }); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data || []) }
