import { NextResponse } from 'next/server'
import { isStaff } from '@/lib/auth'
import { createAdminSupabaseClient } from '@/lib/supabase'
export async function GET(){if(!(await isStaff(['editor','owner'])))return NextResponse.json({error:'Editor access required'},{status:403});const{data,error}=await createAdminSupabaseClient().from('audit_logs').select('*').order('created_at',{ascending:false}).limit(500);return error?NextResponse.json({error:error.message},{status:500}):NextResponse.json(data)}
