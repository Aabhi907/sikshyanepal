import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
export async function GET() { if (!(await isStaff())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { data, error } = await createAdminSupabaseClient().from('institution_claims').select('*').order('created_at', { ascending: false }).limit(500); return error ? NextResponse.json({ error: error.message }, { status: 500 }) : NextResponse.json(data) }
